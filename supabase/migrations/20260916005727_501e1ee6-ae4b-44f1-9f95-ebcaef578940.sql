CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_conversation_participant(_conversation_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = _conversation_id
      AND (c.member_id = _user_id OR c.worker_id = _user_id)
  )
$$;

REVOKE ALL ON FUNCTION private.is_conversation_participant(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_conversation_participant(UUID, UUID) TO authenticated, service_role;

DROP POLICY IF EXISTS messages_read_participant ON public.messages;
DROP POLICY IF EXISTS messages_insert_participant ON public.messages;

CREATE POLICY messages_read_participant ON public.messages
  FOR SELECT TO authenticated
  USING (private.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY messages_insert_participant ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND private.is_conversation_participant(conversation_id, auth.uid())
  );

DROP FUNCTION IF EXISTS public.is_conversation_participant(UUID, UUID);