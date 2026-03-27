const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const contentPath = path.join(projectRoot, 'data', 'launch-seed', 'seed-content.json');
const authorsPath = path.join(projectRoot, 'supabase', 'bootstrap', 'seed-authors.json');
const authorsExamplePath = path.join(projectRoot, 'supabase', 'bootstrap', 'seed-authors.example.json');
const outputDir = path.join(projectRoot, 'supabase', 'bootstrap');
const outputPath = path.join(outputDir, 'seed-launch-content.sql');
const outputTemplatePath = path.join(outputDir, 'seed-launch-content.template.sql');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function escapeSqlString(value) {
  return value.replace(/'/g, "''");
}

function toSqlString(value) {
  return `'${escapeSqlString(value)}'`;
}

function renderGuardForAuthor(authorKey, authorEmail) {
  return `do $$\nbegin\n  if not exists (\n    select 1\n    from public.users\n    where email = ${toSqlString(authorEmail)}\n  ) then\n    raise exception 'Seed author "${escapeSqlString(authorKey)}" with email ${escapeSqlString(authorEmail)} is missing from public.users. Sign in with that account first.';\n  end if;\n\n  if not exists (\n    select 1\n    from public.user_profiles profile\n    join public.users account on account.id = profile.user_id\n    where account.email = ${toSqlString(authorEmail)}\n  ) then\n    raise exception 'Seed author "${escapeSqlString(authorKey)}" has not completed onboarding yet.';\n  end if;\nend $$;`;
}

function renderGuardForTopic(topicSlug) {
  return `do $$\nbegin\n  if not exists (\n    select 1\n    from public.topics\n    where slug = ${toSqlString(topicSlug)}\n      and is_active = true\n  ) then\n    raise exception 'Topic "${escapeSqlString(topicSlug)}" is missing or inactive.';\n  end if;\nend $$;`;
}

function renderPostBlock(post, authorEmail) {
  return `do $$\ndeclare\n  selected_author_id uuid;\n  selected_topic_id uuid;\n  resolved_post_id uuid;\nbegin\n  select id into selected_author_id\n  from public.users\n  where email = ${toSqlString(authorEmail)};\n\n  select id into selected_topic_id\n  from public.topics\n  where slug = ${toSqlString(post.topicSlug)}\n    and is_active = true;\n\n  select id into resolved_post_id\n  from public.posts\n  where user_id = selected_author_id\n    and topic_id = selected_topic_id\n    and title = ${toSqlString(post.title)}\n    and coalesce(body, '') = ${toSqlString(post.body)}\n  limit 1;\n\n  if resolved_post_id is null then\n    insert into public.posts (\n      user_id,\n      topic_id,\n      title,\n      body,\n      post_type,\n      is_anonymous,\n      status,\n      moderation_status\n    )\n    values (\n      selected_author_id,\n      selected_topic_id,\n      ${toSqlString(post.title)},\n      ${toSqlString(post.body)},\n      ${toSqlString(post.postType)},\n      ${post.isAnonymous ? 'true' : 'false'},\n      'open',\n      'clean'\n    )\n    returning id into resolved_post_id;\n  end if;\n\n  insert into temp_launch_posts (seed_key, post_id)\n  values (${toSqlString(post.key)}, resolved_post_id)\n  on conflict (seed_key) do update\n    set post_id = excluded.post_id;\nend $$;`;
}

function renderCommentBlock(postKey, comment, authorEmail) {
  return `insert into public.comments (\n  post_id,\n  user_id,\n  body,\n  moderation_status,\n  is_deleted\n)\nselect\n  seeded.post_id,\n  author_account.id,\n  ${toSqlString(comment.body)},\n  'clean',\n  false\nfrom temp_launch_posts seeded\njoin public.users author_account on author_account.email = ${toSqlString(authorEmail)}\nwhere seeded.seed_key = ${toSqlString(postKey)}\n  and not exists (\n    select 1\n    from public.comments existing\n    where existing.post_id = seeded.post_id\n      and existing.user_id = author_account.id\n      and existing.body = ${toSqlString(comment.body)}\n  );`;
}

function renderReactionBlock(postKey, reaction, authorEmail) {
  return `insert into public.reactions (\n  user_id,\n  target_type,\n  target_id,\n  reaction_type\n)\nselect\n  author_account.id,\n  'post',\n  seeded.post_id,\n  ${toSqlString(reaction.type)}\nfrom temp_launch_posts seeded\njoin public.users author_account on author_account.email = ${toSqlString(authorEmail)}\nwhere seeded.seed_key = ${toSqlString(postKey)}\non conflict (user_id, target_type, target_id, reaction_type) do nothing;`;
}

function renderSaveBlock(postKey, authorEmail) {
  return `insert into public.saves (\n  user_id,\n  post_id\n)\nselect\n  author_account.id,\n  seeded.post_id\nfrom temp_launch_posts seeded\njoin public.users author_account on author_account.email = ${toSqlString(authorEmail)}\nwhere seeded.seed_key = ${toSqlString(postKey)}\non conflict (user_id, post_id) do nothing;`;
}

function collectUsedAuthors(seedContent) {
  const authors = new Set();

  for (const post of seedContent.posts) {
    authors.add(post.author);

    for (const comment of post.comments ?? []) {
      authors.add(comment.author);
    }

    for (const reaction of post.reactions ?? []) {
      authors.add(reaction.author);
    }

    for (const saver of post.saves ?? []) {
      authors.add(saver);
    }
  }

  return [...authors].sort();
}

function buildSql(seedContent, authorMap) {
  const statements = [];
  const usedAuthors = collectUsedAuthors(seedContent);
  const usedTopics = [...new Set(seedContent.posts.map((post) => post.topicSlug))].sort();

  statements.push('-- SideRoom Launch Content Seed');
  statements.push('-- Generated automatically by scripts/build-launch-seed.js');
  statements.push('-- This script expects the listed author accounts to already exist in public.users');
  statements.push('-- and to have completed onboarding so their public handles are available.');
  statements.push('');
  statements.push('begin;');
  statements.push('');
  statements.push('create temporary table if not exists temp_launch_posts (');
  statements.push('  seed_key text primary key,');
  statements.push('  post_id uuid not null');
  statements.push(') on commit drop;');
  statements.push('');

  for (const authorKey of usedAuthors) {
    const authorEmail = authorMap[authorKey];

    if (!authorEmail) {
      throw new Error(`Missing author mapping for "${authorKey}".`);
    }

    statements.push(renderGuardForAuthor(authorKey, authorEmail));
    statements.push('');
  }

  for (const topicSlug of usedTopics) {
    statements.push(renderGuardForTopic(topicSlug));
    statements.push('');
  }

  for (const post of seedContent.posts) {
    const authorEmail = authorMap[post.author];
    statements.push(`-- POST: ${post.key}`);
    statements.push(renderPostBlock(post, authorEmail));
    statements.push('');

    for (const comment of post.comments ?? []) {
      statements.push(renderCommentBlock(post.key, comment, authorMap[comment.author]));
      statements.push('');
    }

    for (const reaction of post.reactions ?? []) {
      statements.push(renderReactionBlock(post.key, reaction, authorMap[reaction.author]));
      statements.push('');
    }

    for (const saver of post.saves ?? []) {
      statements.push(renderSaveBlock(post.key, authorMap[saver]));
      statements.push('');
    }
  }

  statements.push('commit;');
  statements.push('');

  return statements.join('\n');
}

function main() {
  const seedContent = readJson(contentPath);
  const usingRealAuthorMap = fs.existsSync(authorsPath);
  const authorMap = readJson(usingRealAuthorMap ? authorsPath : authorsExamplePath);
  const sql = buildSql(seedContent, authorMap);

  fs.mkdirSync(outputDir, { recursive: true });

  if (usingRealAuthorMap) {
    fs.writeFileSync(outputPath, sql, 'utf8');
    console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
    return;
  }

  fs.writeFileSync(outputTemplatePath, sql, 'utf8');
  console.log(`Wrote ${path.relative(projectRoot, outputTemplatePath)}`);
  console.log('No real seed-authors.json found, so this output uses example emails and is a template only.');
}

main();
