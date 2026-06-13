import { NextResponse } from 'next/server';
import { dbFetchSettings, dbUpdateSettings } from '@/lib/db_helper';

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
    const settings = await dbFetchSettings();
    if (!settings) {
      const seeded = await dbUpdateSettings(defaultSettings);
      return NextResponse.json(formatSettings(seeded));
    }
    return NextResponse.json(formatSettings(settings));
  } catch (error) {
    // If table not set up yet or error, fallback to defaults
    return NextResponse.json(formatSettings(defaultSettings));
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

    const payload = {
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

    const updated = await dbUpdateSettings(payload);
    return NextResponse.json(formatSettings(updated));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
