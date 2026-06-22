-- ============================================================
-- PGShaala: Additional 30 Leads SQL Insert
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

INSERT INTO leads (name, phone, source, budget, preferred_location, status, notes, interests) VALUES
('Aditya Bansal',     '9900002001', 'whatsapp',  '22000', 'Koramangala',       'new',                   'Senior dev at Amazon, needs private room with balcony',              ARRAY['Tech','Fitness']),
('Pooja Venkatesh',   '9900002002', 'instagram', '13500', 'Indiranagar',        'contacted',             'Content creator, needs fast internet and quiet space',               ARRAY['Art','Music','Socializing']),
('Rahul Nair',        '9900002003', 'facebook',  '9000',  'Electronic City',    'new',                   'Fresher at Wipro, first month allowance 9k flat',                    ARRAY['Gaming','Tech']),
('Ankita Singh',      '9900002004', 'whatsapp',  '17500', 'Whitefield',         'requirement_collected', 'PM at Flipkart ITPL, wants attached bathroom, AC',                   ARRAY['Fitness','Reading']),
('Siddharth Menon',   '9900002005', 'website',   '25000', 'HSR Layout',         'property_suggested',    'Fintech startup founder, premium coliving only',                     ARRAY['Startups','Coding','Sports']),
('Kavitha Rajan',     '9900002006', 'whatsapp',  '10000', 'Bannerghatta',       'new',                   'Medical student near Fortis, girls only, veg food',                  ARRAY['Reading','Fitness']),
('Abhishek Tiwari',   '9900002007', 'phone',     '15000', 'Marathahalli',       'new',                   'Data analyst at Capgemini, joining July 15',                         ARRAY['Tech','Gaming']),
('Nandini Gopal',     '9900002008', 'instagram', '18000', 'Bellandur',          'visit_scheduled',       'UX designer, coed luxury coliving preferred',                        ARRAY['Art','Socializing','Fitness']),
('Vivek Choudhary',   '9900002009', 'whatsapp',  '12000', 'Mahadevapura',       'new',                   'QA at Bosch, bike parking mandatory, 2 sharing ok',                  ARRAY['Gaming','Sports']),
('Meghna Iyer',       '9900002010', 'website',   '20000', 'Nagawara/Manyata',   'requirement_collected', 'HR at SAP labs, near Manyata Tech, gym must',                        ARRAY['Fitness','Music','Reading']),
('Tushar Bhosale',    '9900002011', 'facebook',  '8000',  'Yeshwanthpur',       'new',                   'RVCE student, 3 sharing ok, vegetarian food required',               ARRAY['Reading','Coding']),
('Shilpa Rao',        '9900002012', 'whatsapp',  '14000', 'Koramangala',        'contacted',             'Fashion designer at Myntra, girls only, near Nexus',                 ARRAY['Art','Socializing']),
('Manish Gupta',      '9900002013', 'instagram', '16000', 'BTM Layout',         'new',                   'DevOps at ThoughtWorks, wants single occupancy',                     ARRAY['Tech','Gaming','Coding']),
('Bhagyashri Patil',  '9900002014', 'whatsapp',  '11000', 'Electronic City',    'new',                   'Pune native joining Infosys EC, food mandatory',                     ARRAY['Reading','Music']),
('Rohan Mehta',       '9900002015', 'website',   '23000', 'Indiranagar',        'property_suggested',    'Finance professional, premium coliving only, long term',             ARRAY['Startups','Sports','Socializing']),
('Deepika Nayak',     '9900002016', 'whatsapp',  '13000', 'Marathahalli',       'new',                   'Test engineer at Tata Elxsi, girls pg near AECS layout',             ARRAY['Art','Fitness']),
('Kartik Subramaniam','9900002017', 'phone',     '9500',  'Mahadevapura',       'new',                   'Intern at TCS MDC, tight budget, 3 sharing fine',                    ARRAY['Gaming','Tech']),
('Ananya Sharma',     '9900002018', 'instagram', '19000', 'Whitefield',         'contacted',             'iOS dev at Mphasis, single room with attached bath',                 ARRAY['Tech','Reading','Coding']),
('Pratik Wagh',       '9900002019', 'facebook',  '14500', 'HSR Layout',         'new',                   'Android dev, 2 sharing, coed ok, joining Aug',                       ARRAY['Coding','Sports']),
('Varsha Pillai',     '9900002020', 'whatsapp',  '10500', 'Bellandur',          'requirement_collected', 'Nurse at Columbia Asia, girls pg, needs 24hr security',              ARRAY['Fitness','Music']),
('Arnav Bose',        '9900002021', 'website',   '27000', 'Koramangala',        'new',                   'Consulting at McKinsey, premium studio or 1BHK style',               ARRAY['Startups','Socializing','Fitness']),
('Ishita Jain',       '9900002022', 'whatsapp',  '12500', 'BTM Layout',         'new',                   'CA student, vegetarian, girls only, budget is max 12.5k',            ARRAY['Reading','Art']),
('Suresh Babu G',     '9900002023', 'phone',     '8000',  'Electronic City',    'new',                   'IT support at Wipro EC Phase 2, 4 sharing is fine',                  ARRAY['Reading','Gaming']),
('Tanvi Desai',       '9900002024', 'instagram', '16000', 'Nagawara/Manyata',   'contacted',             'Marketing at Google, near Manyata, premium girls pg',                ARRAY['Fitness','Socializing','Music']),
('Mihir Patel',       '9900002025', 'website',   '20000', 'Marathahalli',       'new',                   'AI engineer at IBM, luxury coliving, fast WiFi essential',            ARRAY['Tech','Coding','Startups']),
('Roshni Kumari',     '9900002026', 'whatsapp',  '9000',  'Yeshwanthpur',       'new',                   'BSc nursing student at NIMHANS, very tight budget',                  ARRAY['Fitness','Music']),
('Gaurav Tomar',      '9900002027', 'facebook',  '15000', 'Indiranagar',        'new',                   'Graphic designer, hybrid work, coed coliving preferred',             ARRAY['Art','Music','Socializing']),
('Sneha Patil',       '9900002028', 'whatsapp',  '13500', 'HSR Layout',         'requirement_collected', 'Nurse at Narayana Health, 12-hr shifts, quiet room needed',           ARRAY['Fitness','Reading']),
('Harish Babu',       '9900002029', 'instagram', '17000', 'Whitefield',         'new',                   'Embedded systems eng at Intel, near ITPL, boys pg',                  ARRAY['Tech','Gaming','Coding']),
('Ritika Agarwal',    '9900002030', 'website',   '21000', 'Koramangala',        'property_suggested',    'MBA grad at Deloitte, premium coliving, gym & food must',            ARRAY['Fitness','Startups','Socializing'])
ON CONFLICT (phone) DO NOTHING;

-- Verify count
SELECT COUNT(*) as total_leads FROM leads;
