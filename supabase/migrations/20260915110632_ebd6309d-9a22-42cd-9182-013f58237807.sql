-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','worker')),
  phone TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate NUMERIC,
  available BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC NOT NULL DEFAULT 0,
  jobs_done INTEGER NOT NULL DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- JOBS
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  budget NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT 'Belhar, Cape Town',
  schedule TEXT,
  urgent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Completed','Cancelled')),
  hired_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_public_read" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert_own" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "jobs_update_own" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = poster_id) WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "jobs_delete_own" ON public.jobs FOR DELETE TO authenticated USING (auth.uid() = poster_id);
CREATE INDEX jobs_status_idx ON public.jobs (status, created_at DESC);

-- APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied','Shortlisted','Hired','Rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, worker_id)
);
GRANT SELECT ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications_read" ON public.applications FOR SELECT USING (true);
CREATE POLICY "applications_insert_own" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "applications_update" ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = worker_id OR auth.uid() = (SELECT poster_id FROM public.jobs j WHERE j.id = job_id))
  WITH CHECK (auth.uid() = worker_id OR auth.uid() = (SELECT poster_id FROM public.jobs j WHERE j.id = job_id));
CREATE POLICY "applications_delete_own" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = worker_id);

-- CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member_id, worker_id, job_id)
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_read_participant" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = member_id OR auth.uid() = worker_id);
CREATE POLICY "conversations_insert_participant" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = member_id OR auth.uid() = worker_id);
CREATE POLICY "conversations_update_participant" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() = member_id OR auth.uid() = worker_id) WITH CHECK (auth.uid() = member_id OR auth.uid() = worker_id);

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = _conversation_id AND (c.member_id = _user_id OR c.worker_id = _user_id));
$$;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) TO authenticated;

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_read_participant" ON public.messages FOR SELECT TO authenticated USING (public.is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "messages_insert_participant" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND public.is_conversation_participant(conversation_id, auth.uid()));
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL DEFAULT '',
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payer_name TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Paid' CHECK (status IN ('Pending','Paid')),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_read_own" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = worker_id OR auth.uid() = payer_id);
CREATE POLICY "payments_insert_payer" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = payer_id);
CREATE POLICY "payments_update_payer" ON public.payments FOR UPDATE TO authenticated USING (auth.uid() = payer_id) WITH CHECK (auth.uid() = payer_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  icon TEXT NOT NULL DEFAULT '🔔',
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_any" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER jobs_touch BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- new user -> profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'member'),
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'location', 'Belhar, Cape Town')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============ DEMO DATA ============
INSERT INTO public.profiles (id, full_name, role, location, bio, skills, hourly_rate, rating, jobs_done, is_demo) VALUES
 ('11111111-1111-4111-8111-000000000001','Fatima Adams','member','Belhar Ext 15, Cape Town','Mother of two, works in Bellville. Hires help around the house most weekends.','{}',NULL,4.8,12,true),
 ('11111111-1111-4111-8111-000000000002','Riyaad Isaacs','member','Symphony Way, Belhar','Just moved into a new place on Symphony Way.','{}',NULL,4.9,7,true),
 ('11111111-1111-4111-8111-000000000003','Zanele Ngcobo','member','Modderdam Road, Belhar','Looking for reliable people to help with my kids'' schooling.','{}',NULL,4.7,5,true),
 ('11111111-1111-4111-8111-000000000004','Gavin Solomons','member','Voortrekker Road, Bellville South','Homeowner, hires trades regularly.','{}',NULL,4.5,9,true),
 ('11111111-1111-4111-8111-000000000005','Michelle Jantjies','member','Belhar Ext 22, Cape Town','Renovating the house room by room.','{}',NULL,4.6,4,true),
 ('11111111-1111-4111-8111-000000000006','Pieter van Wyk','member','Belhar Ext 13, Cape Town','Retired, needs a hand with maintenance.','{}',NULL,4.9,15,true),
 ('22222222-2222-4222-8222-000000000001','Sipho Mthembu','worker','Belhar Ext 13, Cape Town','Gardener with 8 years experience. I bring my own weed eater and rake.','{Gardener,Handyman}',85,4.9,47,true),
 ('22222222-2222-4222-8222-000000000002','Lindiwe Mokoena','worker','Belhar Ext 15, Cape Town','Deep cleans and move-in cleans. I can bring a helper at no extra cost.','{Cleaner}',75,5.0,63,true),
 ('22222222-2222-4222-8222-000000000003','Thabo Ndlovu','worker','Belhar, Cape Town','UWC third year BSc student. I tutor Maths and Physical Science.','{Tutor}',120,4.9,18,true),
 ('22222222-2222-4222-8222-000000000004','Ebrahim Davids','worker','Belhar Ext 22, Cape Town','Qualified plumber, 12 years on the job.','{Plumber,Handyman}',180,4.8,55,true),
 ('22222222-2222-4222-8222-000000000005','Wesley Arendse','worker','Symphony Way, Belhar','Registered electrician, I can issue a CoC.','{Electrician}',220,4.9,41,true),
 ('22222222-2222-4222-8222-000000000006','Charmaine Fortuin','worker','Belhar Ext 15, Cape Town','Cleaning and caretaking, weekdays and weekends.','{Cleaner,Caretaker}',70,4.8,38,true),
 ('22222222-2222-4222-8222-000000000007','Nomsa Dlamini','worker','Belhar Ext 13, Cape Town','Garden work, references available from Symphony Way.','{Gardener}',80,4.7,31,true),
 ('22222222-2222-4222-8222-000000000008','Ashwin Petersen','worker','Belhar Ext 22, Cape Town','Handyman and gardener, own tools.','{Gardener,Handyman,Painter}',95,4.6,22,true);

INSERT INTO public.jobs (id, poster_id, title, category, description, budget, location, schedule, urgent, status, hired_worker_id) VALUES
 ('33333333-3333-4333-8333-000000000001','11111111-1111-4111-8111-000000000001','Garden clean-up and hedge trimming','Gardener','Front and back yard needs a proper clean-up. Grass cutting, hedge trimming along the wall and removal of the garden waste. Tools are available on site, you just bring yourself.',450,'Belhar Ext 15, Cape Town','Sat, 8 Aug · 08:00',false,'Open',NULL),
 ('33333333-3333-4333-8333-000000000002','11111111-1111-4111-8111-000000000002','Deep clean 3-bedroom house before move-in','Cleaner','Moving into a new place on Symphony Way and it needs a full deep clean — windows, kitchen cupboards inside and out, bathrooms and floors. Cleaning materials provided.',700,'Symphony Way, Belhar','Thu, 6 Aug · 09:00',true,'Open',NULL),
 ('33333333-3333-4333-8333-000000000003','11111111-1111-4111-8111-000000000003','Grade 10 Maths tutor — twice a week','Tutor','Looking for a patient tutor for my son, Grade 10 Maths. Two sessions a week, an hour each, at our home near Modderdam Road. Ongoing until exams.',250,'Modderdam Road, Belhar','Tue & Thu · 16:00',false,'In Progress','22222222-2222-4222-8222-000000000003'),
 ('33333333-3333-4333-8333-000000000004','11111111-1111-4111-8111-000000000004','Fix leaking kitchen tap and geyser overflow','Plumber','Kitchen mixer tap has been dripping for two weeks and the geyser overflow pipe drips onto the driveway. Need someone who can diagnose and fix same day.',600,'Voortrekker Road, Bellville South','Wed, 5 Aug · 10:00',true,'Open',NULL),
 ('33333333-3333-4333-8333-000000000005','11111111-1111-4111-8111-000000000005','Paint two bedrooms — walls and ceilings','Painter','Two bedrooms need a fresh coat, white ceilings and soft grey walls. Paint already bought, you bring brushes and rollers.',1800,'Belhar Ext 22, Cape Town','Mon, 10 Aug · 08:30',false,'Open',NULL),
 ('33333333-3333-4333-8333-000000000006','11111111-1111-4111-8111-000000000006','Install outside plug points and security light','Electrician','Need two weatherproof plug points at the back door and a motion sensor security light above the garage. Certificate of compliance would be a bonus.',1200,'Belhar Ext 13, Cape Town','Fri, 7 Aug · 13:00',false,'Completed','22222222-2222-4222-8222-000000000005'),
 ('33333333-3333-4333-8333-000000000007','11111111-1111-4111-8111-000000000001','Weekend caretaker for elderly parent','Caretaker','Someone kind and patient to sit with my mother on Saturdays, help with meals and medication reminders.',950,'Belhar Ext 15, Cape Town','Sat · 09:00 - 16:00',false,'Open',NULL),
 ('33333333-3333-4333-8333-000000000008','11111111-1111-4111-8111-000000000002','Small handyman jobs around the house','Handyman','Hang two doors properly, fix a cupboard hinge and put up a curtain rail. Half a day of work.',400,'Symphony Way, Belhar','Sun, 9 Aug · 10:00',false,'Open',NULL);

INSERT INTO public.applications (job_id, worker_id, note, status) VALUES
 ('33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000001','I live in Belhar Ext 13, can start early Saturday.','Shortlisted'),
 ('33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000008','I have my own weed eater and rake.','Applied'),
 ('33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000007','Available all weekend, references from Symphony Way.','Applied'),
 ('33333333-3333-4333-8333-000000000002','22222222-2222-4222-8222-000000000002','I do deep cleans every week, can bring a helper at no extra cost.','Applied'),
 ('33333333-3333-4333-8333-000000000002','22222222-2222-4222-8222-000000000006','Available Thursday from 08:00.','Applied'),
 ('33333333-3333-4333-8333-000000000003','22222222-2222-4222-8222-000000000003','UWC student, third year BSc. I tutor Maths and Physical Science.','Hired'),
 ('33333333-3333-4333-8333-000000000004','22222222-2222-4222-8222-000000000004','Qualified plumber, 12 years. I can come through at 10:00.','Applied'),
 ('33333333-3333-4333-8333-000000000006','22222222-2222-4222-8222-000000000005','Registered electrician, I can issue a CoC.','Hired');

INSERT INTO public.reviews (job_id, reviewer_id, reviewee_id, rating, comment) VALUES
 ('33333333-3333-4333-8333-000000000006','11111111-1111-4111-8111-000000000006','22222222-2222-4222-8222-000000000005',5,'Neat work and explained everything. Would definitely hire again.'),
 ('33333333-3333-4333-8333-000000000001','11111111-1111-4111-8111-000000000001','22222222-2222-4222-8222-000000000001',5,'Arrived exactly on time and worked straight through. The yard looks brand new.'),
 ('33333333-3333-4333-8333-000000000002','11111111-1111-4111-8111-000000000002','22222222-2222-4222-8222-000000000002',4,'Good job overall, just arrived twenty minutes late because of the taxi.');