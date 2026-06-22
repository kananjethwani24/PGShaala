import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

// 50 realistic Bangalore PG-seeker leads — diverse areas and profiles
const leads = [
    // Original 20
    { name: 'Ritu Malhotra', phone: '9900001001', source: 'whatsapp', budget: '13000', preferred_location: 'Koramangala', status: 'new', notes: 'Working at Wipro, needs girls PG near Nexus Mall', interests: ['Fitness', 'Music'] },
    { name: 'Arjun Pillai', phone: '9900001002', source: 'instagram', budget: '15000', preferred_location: 'Koramangala', status: 'contacted', notes: 'Software engineer, coed ok, 1-year stay', interests: ['Coding', 'Tech'] },
    { name: 'Swati Bhatt', phone: '9900001003', source: 'whatsapp', budget: '11000', preferred_location: 'BTM Layout', status: 'new', notes: 'Student at Christ University, vegetarian food must', interests: ['Art', 'Reading'] },
    { name: 'Kiran Deshmukh', phone: '9900001004', source: 'website', budget: '18000', preferred_location: 'BTM Layout', status: 'requirement_collected', notes: 'Prefers AC room, attached bathroom, joining next month', interests: ['Gaming', 'Tech'] },
    { name: 'Prashant Sharma', phone: '9900001005', source: 'phone', budget: '9500', preferred_location: 'Bellandur', status: 'new', notes: 'Works at Embassy Tech Park, budget strict', interests: ['Reading', 'Music'] },
    { name: 'Divya Krishnan', phone: '9900001006', source: 'whatsapp', budget: '16000', preferred_location: 'Bellandur', status: 'property_suggested', notes: 'Premium PG, girls only, long stay 2 years', interests: ['Fitness', 'Socializing'] },
    { name: 'Mohit Aggarwal', phone: '9900001007', source: 'facebook', budget: '17000', preferred_location: 'Whitefield', status: 'new', notes: 'Working at Infosys, coed with good wifi', interests: ['Tech', 'Startups'] },
    { name: 'Ranjitha S', phone: '9900001008', source: 'whatsapp', budget: '12000', preferred_location: 'Whitefield', status: 'contacted', notes: 'Nearby ITPL Gate 2, needs laundry facility', interests: ['Fitness', 'Art'] },
    { name: 'Saurabh Mishra', phone: '9900001009', source: 'instagram', budget: '14000', preferred_location: 'Marathahalli', status: 'new', notes: 'AC room with food, boys only preferred', interests: ['Gaming', 'Coding'] },
    { name: 'Hemalatha Devi', phone: '9900001010', source: 'whatsapp', budget: '10000', preferred_location: 'Marathahalli', status: 'requirement_collected', notes: 'Girls PG near Marathahalli bridge, strict vegetarian', interests: ['Reading', 'Music'] },
    { name: 'Tej Raju', phone: '9900001011', source: 'website', budget: '20000', preferred_location: 'Mahadevapura', status: 'new', notes: 'Senior engineer at Accenture, luxury stay required', interests: ['Startups', 'Tech'] },
    { name: 'Fathima Noor', phone: '9900001012', source: 'whatsapp', budget: '11500', preferred_location: 'Mahadevapura', status: 'contacted', notes: 'Halal food preference, near Bagmane Tech Park', interests: ['Music', 'Art'] },
    { name: 'Lalji Yadav', phone: '9900001013', source: 'phone', budget: '8500', preferred_location: 'Yeshwanthpur', status: 'new', notes: 'Student at RV College, very tight budget', interests: ['Reading', 'Gaming'] },
    { name: 'Rekha Nambiar', phone: '9900001014', source: 'whatsapp', budget: '13500', preferred_location: 'Yeshwanthpur', status: 'new', notes: 'Girls PG, joining immediately, needs storage locker', interests: ['Fitness', 'Socializing'] },
    { name: 'Akash Parekh', phone: '9900001015', source: 'instagram', budget: '19000', preferred_location: 'HSR Layout', status: 'visit_scheduled', notes: 'Startup founder, needs co-working space and fast wifi', interests: ['Startups', 'Coding', 'Tech'] },
    { name: 'Sunitha Reddy', phone: '9900001016', source: 'whatsapp', budget: '10500', preferred_location: 'HSR Layout', status: 'new', notes: 'Girls only, near Silk Board flyover, no guest policy ok', interests: ['Art', 'Reading'] },
    { name: 'Nitin Jha', phone: '9900001017', source: 'facebook', budget: '16500', preferred_location: 'Nagawara/Manyata', status: 'new', notes: 'Works at Manyata Tech, needs gym and food included', interests: ['Fitness', 'Gaming'] },
    { name: 'Shraddha Kulkarni', phone: '9900001018', source: 'whatsapp', budget: '12500', preferred_location: 'Nagawara/Manyata', status: 'requirement_collected', notes: 'Near Hebbal flyover, girls PG, joining Aug 1', interests: ['Socializing', 'Music'] },
    { name: 'Pradeep Kumar', phone: '9900001019', source: 'website', budget: '14500', preferred_location: 'Electronic City', status: 'new', notes: 'Works at TCS EC, needs bike parking', interests: ['Reading', 'Sports'] },
    { name: 'Jyothi Padmanabhan', phone: '9900001020', source: 'whatsapp', budget: '11000', preferred_location: 'Electronic City', status: 'contacted', notes: 'Girls PG near Phase 1 EC, vegetarian food must', interests: ['Fitness', 'Art'] },

    // 30 new leads
    { name: 'Aditya Bansal', phone: '9900002001', source: 'whatsapp', budget: '22000', preferred_location: 'Koramangala', status: 'new', notes: 'Senior dev at Amazon, needs private room with balcony', interests: ['Tech', 'Fitness'] },
    { name: 'Pooja Venkatesh', phone: '9900002002', source: 'instagram', budget: '13500', preferred_location: 'Indiranagar', status: 'contacted', notes: 'Content creator, needs fast internet and quiet space', interests: ['Art', 'Music', 'Socializing'] },
    { name: 'Rahul Nair', phone: '9900002003', source: 'facebook', budget: '9000', preferred_location: 'Electronic City', status: 'new', notes: 'Fresher at Wipro, first month allowance ₹9k flat', interests: ['Gaming', 'Tech'] },
    { name: 'Ankita Singh', phone: '9900002004', source: 'whatsapp', budget: '17500', preferred_location: 'Whitefield', status: 'requirement_collected', notes: 'PM at Flipkart ITPL, wants attached bathroom, AC', interests: ['Fitness', 'Reading'] },
    { name: 'Siddharth Menon', phone: '9900002005', source: 'website', budget: '25000', preferred_location: 'HSR Layout', status: 'property_suggested', notes: 'Fintech startup founder, premium coliving only', interests: ['Startups', 'Coding', 'Sports'] },
    { name: 'Kavitha Rajan', phone: '9900002006', source: 'whatsapp', budget: '10000', preferred_location: 'Bannerghatta', status: 'new', notes: 'Medical student near Fortis, girls only, veg food', interests: ['Reading', 'Fitness'] },
    { name: 'Abhishek Tiwari', phone: '9900002007', source: 'phone', budget: '15000', preferred_location: 'Marathahalli', status: 'new', notes: 'Data analyst at Capgemini, joining July 15', interests: ['Tech', 'Gaming'] },
    { name: 'Nandini Gopal', phone: '9900002008', source: 'instagram', budget: '18000', preferred_location: 'Bellandur', status: 'visit_scheduled', notes: 'UX designer, coed luxury coliving preferred', interests: ['Art', 'Socializing', 'Fitness'] },
    { name: 'Vivek Choudhary', phone: '9900002009', source: 'whatsapp', budget: '12000', preferred_location: 'Mahadevapura', status: 'new', notes: 'QA at Bosch, bike parking mandatory, 2 sharing ok', interests: ['Gaming', 'Sports'] },
    { name: 'Meghna Iyer', phone: '9900002010', source: 'website', budget: '20000', preferred_location: 'Nagawara/Manyata', status: 'requirement_collected', notes: 'HR at SAP labs, near Manyata Tech, gym must', interests: ['Fitness', 'Music', 'Reading'] },
    { name: 'Tushar Bhosale', phone: '9900002011', source: 'facebook', budget: '8000', preferred_location: 'Yeshwanthpur', status: 'new', notes: 'RVCE student, 3 sharing ok, vegetarian food required', interests: ['Reading', 'Coding'] },
    { name: 'Shilpa Rao', phone: '9900002012', source: 'whatsapp', budget: '14000', preferred_location: 'Koramangala', status: 'contacted', notes: 'Fashion designer at Myntra, girls only, near Nexus', interests: ['Art', 'Socializing'] },
    { name: 'Manish Gupta', phone: '9900002013', source: 'instagram', budget: '16000', preferred_location: 'BTM Layout', status: 'new', notes: 'DevOps at ThoughtWorks, wants single occupancy', interests: ['Tech', 'Gaming', 'Coding'] },
    { name: 'Bhagyashri Patil', phone: '9900002014', source: 'whatsapp', budget: '11000', preferred_location: 'Electronic City', status: 'new', notes: 'Pune native joining Infosys EC, food mandatory', interests: ['Reading', 'Music'] },
    { name: 'Rohan Mehta', phone: '9900002015', source: 'website', budget: '23000', preferred_location: 'Indiranagar', status: 'property_suggested', notes: 'Finance professional, premium coliving only, long term', interests: ['Startups', 'Sports', 'Socializing'] },
    { name: 'Deepika Nayak', phone: '9900002016', source: 'whatsapp', budget: '13000', preferred_location: 'Marathahalli', status: 'new', notes: 'Test engineer at Tata Elxsi, girls pg near AECS layout', interests: ['Art', 'Fitness'] },
    { name: 'Kartik Subramaniam', phone: '9900002017', source: 'phone', budget: '9500', preferred_location: 'Mahadevapura', status: 'new', notes: 'Intern at TCS MDC, tight budget, 3 sharing fine', interests: ['Gaming', 'Tech'] },
    { name: 'Ananya Sharma', phone: '9900002018', source: 'instagram', budget: '19000', preferred_location: 'Whitefield', status: 'contacted', notes: 'iOS dev at Mphasis, single room with attached bath', interests: ['Tech', 'Reading', 'Coding'] },
    { name: 'Pratik Wagh', phone: '9900002019', source: 'facebook', budget: '14500', preferred_location: 'HSR Layout', status: 'new', notes: 'Android dev, 2 sharing, coed ok, joining Aug', interests: ['Coding', 'Sports'] },
    { name: 'Varsha Pillai', phone: '9900002020', source: 'whatsapp', budget: '10500', preferred_location: 'Bellandur', status: 'requirement_collected', notes: 'Nurse at Columbia Asia, girls pg, needs 24hr security', interests: ['Fitness', 'Music'] },
    { name: 'Arnav Bose', phone: '9900002021', source: 'website', budget: '27000', preferred_location: 'Koramangala', status: 'new', notes: 'Consulting at McKinsey, premium studio or 1BHK style', interests: ['Startups', 'Socializing', 'Fitness'] },
    { name: 'Ishita Jain', phone: '9900002022', source: 'whatsapp', budget: '12500', preferred_location: 'BTM Layout', status: 'new', notes: 'CA student, vegetarian, girls only, budget is max 12.5k', interests: ['Reading', 'Art'] },
    { name: 'Suresh Babu G', phone: '9900002023', source: 'phone', budget: '8000', preferred_location: 'Electronic City', status: 'new', notes: 'IT support at Wipro EC Phase 2, 4 sharing is fine', interests: ['Reading', 'Gaming'] },
    { name: 'Tanvi Desai', phone: '9900002024', source: 'instagram', budget: '16000', preferred_location: 'Nagawara/Manyata', status: 'contacted', notes: 'Marketing at Google, near Manyata, premium girls pg', interests: ['Fitness', 'Socializing', 'Music'] },
    { name: 'Mihir Patel', phone: '9900002025', source: 'website', budget: '20000', preferred_location: 'Marathahalli', status: 'new', notes: 'AI engineer at IBM, luxury coliving, fast WiFi essential', interests: ['Tech', 'Coding', 'Startups'] },
    { name: 'Roshni Kumari', phone: '9900002026', source: 'whatsapp', budget: '9000', preferred_location: 'Yeshwanthpur', status: 'new', notes: 'BSc nursing student at NIMHANS, very tight budget', interests: ['Fitness', 'Music'] },
    { name: 'Gaurav Tomar', phone: '9900002027', source: 'facebook', budget: '15000', preferred_location: 'Indiranagar', status: 'new', notes: 'Graphic designer, hybrid work, coed coliving preferred', interests: ['Art', 'Music', 'Socializing'] },
    { name: 'Sneha Patil', phone: '9900002028', source: 'whatsapp', budget: '13500', preferred_location: 'HSR Layout', status: 'requirement_collected', notes: 'Nurse at Narayana Health, 12-hr shifts, quiet room needed', interests: ['Fitness', 'Reading'] },
    { name: 'Harish Babu', phone: '9900002029', source: 'instagram', budget: '17000', preferred_location: 'Whitefield', status: 'new', notes: 'Embedded systems eng at Intel, near ITPL, boys pg', interests: ['Tech', 'Gaming', 'Coding'] },
    { name: 'Ritika Agarwal', phone: '9900002030', source: 'website', budget: '21000', preferred_location: 'Koramangala', status: 'property_suggested', notes: 'MBA grad at Deloitte, premium coliving, gym & food must', interests: ['Fitness', 'Startups', 'Socializing'] },
];

async function seedMoreLeads() {
    console.log(`Seeding ${leads.length} leads...`);
    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (const lead of leads) {
        // Check if phone already exists
        const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('phone', lead.phone)
            .single();

        if (existing) {
            console.log(`  SKIP  ${lead.name} (phone already exists)`);
            skipped++;
            continue;
        }

        const { error } = await supabase.from('leads').insert({
            name: lead.name,
            phone: lead.phone,
            source: lead.source as any,
            budget: lead.budget,
            preferred_location: lead.preferred_location,
            status: lead.status as any,
            notes: lead.notes,
            interests: lead.interests,
        });

        if (error) {
            console.error(`  ERROR ${lead.name}:`, JSON.stringify(error));
            failed++;
        } else {
            console.log(`  OK    ${lead.name} \u2192 ${lead.preferred_location} (\u20b9${lead.budget})`);
            inserted++;
        }
    }

    console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}, Failed: ${failed}`);
    process.exit(0);
}

seedMoreLeads().catch(e => { console.error('Fatal:', e); process.exit(1); });
