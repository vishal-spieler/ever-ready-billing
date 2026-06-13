import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const defaultSettings = {
  id: 1,
  name: 'EVER READY ENGINEERS',
  address: 'Plate no 192/1, sr.no 1 Nilai nivas Nagarsolapur road, Mirajaon, Ahilyanagar -414402',
  phone: '8888162227',
  email: 'erengieners01@gmail.com',
  gstin: '27FBFD9897L1Z5',
  pan: 'FBFD9897L',
  bank_name: 'Ahilyanagar co-operative bank',
  bank_branch: 'Chincholi Kaldat',
  account_name: 'Ever Ready Engineers',
  account_no: '02161102100018',
  ifsc_code: 'AHDC0000216'
};

function formatSettings(settings) {
  if (!settings) return {};
  return {
    ...settings,
    bankName: settings.bank_name,
    bankBranch: settings.bank_branch,
    accountName: settings.account_name,
    accountNo: settings.account_no,
    ifscCode: settings.ifsc_code,
  };
}

export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;

    if (!settings) {
      // Auto-seed default settings
      const { data: seeded, error: seedError } = await supabase
        .from('company_settings')
        .insert([defaultSettings])
        .select()
        .single();
      
      if (seedError) {
        // Table might not exist or insert failed, return default settings anyway as fallback
        return NextResponse.json(formatSettings(defaultSettings));
      }
      return NextResponse.json(formatSettings(seeded));
    }

    return NextResponse.json(formatSettings(settings));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    const name = data.name;
    const address = data.address;
    const phone = data.phone;
    const email = data.email;
    const gstin = data.gstin;
    const pan = data.pan;
    const bank_name = data.bank_name !== undefined ? data.bank_name : data.bankName;
    const bank_branch = data.bank_branch !== undefined ? data.bank_branch : data.bankBranch;
    const account_name = data.account_name !== undefined ? data.account_name : data.accountName;
    const account_no = data.account_no !== undefined ? data.account_no : data.accountNo;
    const ifsc_code = data.ifsc_code !== undefined ? data.ifsc_code : data.ifscCode;

    // Check if settings row exists
    const { data: existing } = await supabase
      .from('company_settings')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    const updatePayload = {
      name,
      address,
      phone,
      email,
      gstin,
      pan,
      bank_name,
      bank_branch,
      account_name,
      account_no,
      ifsc_code
    };

    let result;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('company_settings')
        .update(updatePayload)
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('company_settings')
        .insert([{ id: 1, ...updatePayload }])
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    return NextResponse.json(formatSettings(result));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
