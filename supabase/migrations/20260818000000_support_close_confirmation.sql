alter table public.support_conversations
  drop constraint if exists support_conversations_status_check;

alter table public.support_conversations
  add constraint support_conversations_status_check
  check (status in ('open', 'pending_close', 'closed'));
