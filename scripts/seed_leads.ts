import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

// 30 realistic Bangalore PG-seeker leads
const leads = [
    { name: 'Priya Sharma', phone: '9876543201', source: 'whatsapp', budget: '12000', preferred_location: 'Koramangala', status: 'new', notes: 'Looking for girls PG near Nexus Mall', interests: ['Fitness', 'Coding'] },
    { name: 'Rahul Verma', phone: '9876543202', source: 'whatsapp', budget: '15000', preferred_location: 'BTM Layout', status: 'contacted', notes: 'Needs AC room, joinig June 15', interests: ['Gaming', 'Music'] },
    { name: 'Ananya Iyer', phone: '9876543203', source: 'instagram', budget: '10000', preferred_location: 'Bellandur', status: 'requirement_collected', notes: 'Vegetarian food mandatory', interests: ['Fitness', 'Art'] },
    { name: 'Karan Mehta', phone: '9876543204', source: 'website', budget: '18000', preferred_location: 'Whitefield', status: 'property_suggested', notes: 'Wants attached bathroom, coed ok', interests: ['Tech', 'Startups'] },
    { name: 'Deepika Nair', phone: '9876543205', source: 'phone', budget: '9000', preferred_location: 'Electronic City', status: 'new', notes: 'Budget strict, joining July 1', interests: ['Reading', 'Music'] },
    { name: 'Arun Kumar', phone: '9876543206', source: 'whatsapp', budget: '14000', preferred_location: 'Marathahalli', status: 'new', notes: 'Needs parking for bike', interests: ['Fitness', 'Tech'] },
    { name: 'Sneha Reddy', phone: '9876543207', source: 'whatsapp', budget: '11000', preferred_location: 'HSR Layout', status: 'contacted', notes: 'Girls only PG preferred', interests: ['Socializing', 'Art'] },
    { name: 'Vivek Patel', phone: '9876543208', source: 'facebook', budget: '20000', preferred_location: 'Koramangala', status: 'visit_scheduled', notes: 'Wants premium coliving, long stay 1yr', interests: ['Coding', 'Startups'] },
    { name: 'Meera Joshi', phone: '9876543209', source: 'whatsapp', budget: '13000', preferred_location: 'Indiranagar', status: 'new', notes: 'Joining immediately, needs storage', interests: ['Music', 'Socializing'] },
    { name: 'Rohan Singh', phone: '9876543210', source: 'instagram', budget: '16000', preferred_location: 'Bellandur', status: 'new', notes: 'WFH setup needed, quiet room', interests: ['Tech', 'Coding'] },
    { name: 'Pooja Gupta', phone: '9876543211', source: 'whatsapp', budget: '8000', preferred_location: 'Electronic City', status: 'requirement_collected', notes: 'First time renter, needs all meals', interests: ['Reading', 'Fitness'] },
    { name: 'Nikhil Nayak', phone: '9876543212', source: 'website', budget: '17000', preferred_location: 'Mahadevapura', status: 'contacted', notes: 'Prefers ground floor due to knee issues', interests: ['Gaming', 'Tech'] },
    { name: 'Aditi Chawla', phone: '9876543213', source: 'whatsapp', budget: '12500', preferred_location: 'Yeshwanthpur', status: 'new', notes: 'Joining Sept, price negotiable', interests: ['Art', 'Music'] },
    { name: 'Siddharth Bose', phone: '9876543214', source: 'phone', budget: '25000', preferred_location: 'Koramangala', status: 'property_suggested', notes: 'Luxury PG only, company-sponsored', interests: ['Fitness', 'Socializing', 'Tech'] },
    { name: 'Kavya Menon', phone: '9876543215', source: 'whatsapp', budget: '11500', preferred_location: 'Brookefield', status: 'new', notes: 'Nearby ITPL office, needs reliable wifi', interests: ['Coding', 'Reading'] },
    { name: 'Arjun Das', phone: '9876543216', source: 'instagram', budget: '13500', preferred_location: 'HSR Layout', status: 'contacted', notes: 'Veg food + gym facility preferred', interests: ['Fitness', 'Gaming'] },
    { name: 'Lakshmi Prasad', phone: '9876543217', source: 'whatsapp', budget: '9500', preferred_location: 'BTM Layout', status: 'new', notes: 'Very tight budget, okay with dorms', interests: ['Reading', 'Art'] },
    { name: 'Manish Tiwari', phone: '9876543218', source: 'facebook', budget: '14500', preferred_location: 'Whitefield', status: 'requirement_collected', notes: 'Night shift worker, needs flexible timing', interests: ['Gaming', 'Music'] },
    { name: 'Shruti Agarwal', phone: '9876543219', source: 'whatsapp', budget: '19000', preferred_location: 'Marathahalli', status: 'visit_scheduled', notes: 'Couple accommodation or large private room', interests: ['Socializing', 'Fitness'] },
    { name: 'Abhishek Roy', phone: '9876543220', source: 'website', budget: '15500', preferred_location: 'Nagawara/Manyata', status: 'contacted', notes: 'Pet-friendly PG preferred if available', interests: ['Tech', 'Startups'] },
    { name: 'Nisha Pillai', phone: '9876543221', source: 'whatsapp', budget: '10500', preferred_location: 'Koramangala', status: 'new', notes: 'Joining July 10th, needs laundry', interests: ['Fitness', 'Art'] },
    { name: 'Gaurav Khanna', phone: '9876543222', source: 'instagram', budget: '22000', preferred_location: 'Indiranagar', status: 'new', notes: 'Premium required, work from branded startup', interests: ['Startups', 'Coding', 'Socializing'] },
    { name: 'Tanvir Ahmed', phone: '9876543223', source: 'whatsapp', budget: '12000', preferred_location: 'Mahadevapura', status: 'requirement_collected', notes: 'Muslim dietary - halal food preference', interests: ['Music', 'Gaming'] },
    { name: 'Ritika Kapoor', phone: '9876543224', source: 'phone', budget: '16500', preferred_location: 'Bellandur', status: 'new', notes: 'Working professional, late entry required', interests: ['Fitness', 'Tech'] },
    { name: 'Varun Shetty', phone: '9876543225', source: 'whatsapp', budget: '13000', preferred_location: 'BTM Layout', status: 'contacted', notes: 'Nearby metro station preferred', interests: ['Reading', 'Socializing'] },
    { name: 'Pallavi Jain', phone: '9876543226', source: 'website', budget: '10000', preferred_location: 'Yeshwanthpur', status: 'new', notes: 'Student, college nearby Yeshwanthpur', interests: ['Art', 'Music', 'Reading'] },
    { name: 'Suresh Mohan', phone: '9876543227', source: 'whatsapp', budget: '18500', preferred_location: 'Brookefield', status: 'property_suggested', notes: 'Software engineer at Accenture ITPL', interests: ['Coding', 'Gaming', 'Tech'] },
    { name: 'Anjali Tiwary', phone: '9876543228', source: 'facebook', budget: '11000', preferred_location: 'HSR Layout', status: 'new', notes: 'Joining from Jaipur, new to Blore', interests: ['Socializing', 'Fitness', 'Art'] },
    { name: 'Dev Bhatia', phone: '9876543229', source: 'whatsapp', budget: '21000', preferred_location: 'Koramangala', status: 'requirement_collected', notes: 'Startup founder, needs fast wifi + meeting room', interests: ['Startups', 'Coding', 'Tech'] },
    { name: 'Sarika Deshpande', phone: '9876543230', source: 'instagram', budget: '14000', preferred_location: 'Nagawara/Manyata', status: 'new', notes: 'Near Manyata Tech Park, food included preferred', interests: ['Fitness', 'Music'] },
];

async function seedLeads() {
    console.log(`Seeding ${leads.length} leads...`);
    let inserted = 0;
    let skipped = 0;

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
            console.error(`  ERROR ${lead.name}: ${error.message}`);
        } else {
            console.log(`  OK    ${lead.name} → ${lead.preferred_location} (₹${lead.budget})`);
            inserted++;
        }
    }

    console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
}

seedLeads();
