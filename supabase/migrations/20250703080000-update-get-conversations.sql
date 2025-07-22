-- Replace the get_conversations function to support sidebar logic
create or replace function get_conversations(p_user_id uuid)
returns table (
  partner_id uuid,
  full_name text,
  avatar_url text,
  last_message_content text,
  last_message_created_at timestamptz,
  last_message_sender_id uuid,
  last_message_read boolean
)
language sql
as $$
  select
    case
      when m.sender_id = p_user_id then m.receiver_id
      else m.sender_id
    end as partner_id,
    coalesce(p.full_name, 'Unknown User') as full_name,
    p.avatar_url,
    m.content as last_message_content,
    m.created_at as last_message_created_at,
    m.sender_id as last_message_sender_id,
    m.is_read as last_message_read
  from (
    select distinct on (
      least(sender_id, receiver_id), greatest(sender_id, receiver_id)
    ) *
    from messages
    where sender_id = p_user_id or receiver_id = p_user_id
    order by least(sender_id, receiver_id), greatest(sender_id, receiver_id), created_at desc
  ) m
  left join profiles p
    on p.id = case
      when m.sender_id = p_user_id then m.receiver_id
      else m.sender_id
    end
  order by m.created_at desc;
$$; 