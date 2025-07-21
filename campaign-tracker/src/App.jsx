import { useEffect, useState } from 'react';
import './App.css';
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, authenticate, appId } from './firebase';
import DeleteModal from './DeleteModal.jsx';

const initialState = {
  campaignName: '',
  salesKPI: '',
  description: '',
  startDate: '',
  endDate: '',
};

function App() {
  const [userId, setUserId] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialState);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let unsub = () => {};
    authenticate()
      .then((uid) => {
        setUserId(uid);
        const colRef = collection(db, `artifacts/${appId}/users/${uid}/marketingCampaigns`);
        unsub = onSnapshot(colRef, (snap) => {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          data.sort((a, b) => a.startDate.localeCompare(b.startDate));
          setCampaigns(data);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(initialState);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.campaignName || !form.salesKPI) return;
    try {
      const colRef = collection(db, `artifacts/${appId}/users/${userId}/marketingCampaigns`);
      if (editId) {
        await updateDoc(doc(colRef, editId), form);
      } else {
        await addDoc(colRef, { ...form, createdAt: new Date().toISOString() });
      }
      resetForm();
    } catch (err) {
      console.error('Error saving campaign', err);
    }
  };

  const handleDelete = async () => {
    try {
      const colRef = collection(db, `artifacts/${appId}/users/${userId}/marketingCampaigns`);
      await deleteDoc(doc(colRef, deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const startEdit = (campaign) => {
    setForm({
      campaignName: campaign.campaignName || '',
      salesKPI: campaign.salesKPI || '',
      description: campaign.description || '',
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
    });
    setEditId(campaign.id);
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="max-w-4xl w-full space-y-6 bg-white shadow-xl rounded-xl p-6">
        <h1 className="text-xl font-bold text-center">Marketing Campaign Tracker</h1>
        <p className="text-center text-sm text-gray-500">User ID: {userId}</p>
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg shadow-inner p-4 space-y-4">
          <div>
            <label className="font-semibold">ชื่อแคมเปญ (Campaign Name)</label>
            <input
              type="text"
              name="campaignName"
              value={form.campaignName}
              onChange={handleChange}
              className="w-full border rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="font-semibold">ยอดขาย KPI (Sales KPI)</label>
            <input
              type="text"
              name="salesKPI"
              value={form.salesKPI}
              onChange={handleChange}
              className="w-full border rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="font-semibold">รายละเอียด (Description)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">วันที่เริ่ม (Start Date)</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div>
              <label className="font-semibold">วันที่สิ้นสุด (End Date)</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full border rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition transform hover:scale-105 ${editId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {editId ? 'บันทึกการแก้ไข (Save Changes)' : 'เพิ่มแคมเปญ (Add Campaign)'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg shadow-md"
              >
                ยกเลิก (Cancel)
              </button>
            )}
          </div>
        </form>
        <div>
          {loading ? (
            <p>กำลังโหลดข้อมูล... (Loading data...)</p>
          ) : campaigns.length === 0 ? (
            <p>ยังไม่มีแคมเปญในรายการ (No campaigns yet.)</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div key={c.id} className="bg-white border rounded-lg shadow-sm p-4">
                  <h2 className="font-bold text-lg">{c.campaignName}</h2>
                  <p className="text-sm text-gray-600">{c.salesKPI}</p>
                  <p className="text-sm mt-1">{c.description}</p>
                  <p className="text-sm">{c.startDate} - {c.endDate}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md shadow-sm px-3 py-1"
                    >
                      แก้ไข (Edit)
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm rounded-md shadow-sm px-3 py-1"
                    >
                      ลบ (Delete)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {deleteId && (
        <DeleteModal onDelete={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

export default App;
