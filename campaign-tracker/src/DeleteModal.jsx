export default function DeleteModal({ onDelete, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm text-center">
        <p className="mb-4">ยืนยันการลบแคมเปญ? (Are you sure you want to delete?)</p>
        <div className="flex justify-center gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg" onClick={onDelete}>
            ลบ (Delete)
          </button>
          <button className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg" onClick={onCancel}>
            ยกเลิก (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
}
