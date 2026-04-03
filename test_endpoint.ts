import axios from 'axios';
const API_URL = 'http://localhost:4000/api';

async function test() {
  try {
    const res = await axios.post(`${API_URL}/master-ledger/import`, { data: [] });
    console.log('Status:', res.status);
  } catch (err: any) {
    console.log('Error status:', err.response?.status);
  }
}
test();
