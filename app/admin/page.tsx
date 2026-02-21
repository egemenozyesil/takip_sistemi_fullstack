'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Plus, Pencil, LogIn, X, Loader2 } from 'lucide-react';

interface StudentWithUser {
  id: string;
  user_id: string;
  student_number: string;
  department: string | null;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  updated_at: string;
  user_name: string;
  user_email: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithUser | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Liste alınamadı');
      }
      const data = await res.json();
      setStudents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleImpersonate = async (studentId: string) => {
    setImpersonating(studentId);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Giriş yapılamadı');
      }
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu');
      setImpersonating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Öğrenci Yönetimi</h1>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus size={18} />
          Yeni Öğrenci
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ad</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Öğrenci No</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bölüm</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Telefon</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Henüz öğrenci kaydı yok.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{s.user_name}</td>
                    <td className="py-3 px-4 text-gray-600">{s.user_email}</td>
                    <td className="py-3 px-4 text-gray-600">{s.student_number}</td>
                    <td className="py-3 px-4 text-gray-600">{s.department ?? '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{s.phone ?? '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingStudent(s);
                            setShowEditModal(true);
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImpersonate(s.id)}
                          disabled={impersonating === s.id}
                        >
                          {impersonating === s.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <LogIn size={14} />
                          )}
                          <span className="ml-1">Öğrenci olarak giriş</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            setError(null);
            fetchStudents();
          }}
          onError={setError}
        />
      )}

      {showEditModal && editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingStudent(null);
            setError(null);
            fetchStudents();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

function AddStudentModal({
  onClose,
  onSuccess,
  onError,
}: {
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string | null) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [student_number, setStudentNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    if (!name.trim() || !email.trim() || !password.trim() || !student_number.trim()) {
      onError('Ad, email, şifre ve öğrenci numarası zorunludur.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          student_number: student_number.trim(),
          department: department.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Oluşturulamadı');
      onSuccess();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Yeni Öğrenci</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input label="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input label="Öğrenci Numarası" value={student_number} onChange={(e) => setStudentNumber(e.target.value)} required />
          <Input label="Bölüm" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditStudentModal({
  student,
  onClose,
  onSuccess,
  onError,
}: {
  student: StudentWithUser;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string | null) => void;
}) {
  const [name, setName] = useState(student.user_name);
  const [email, setEmail] = useState(student.user_email);
  const [student_number, setStudentNumber] = useState(student.student_number);
  const [department, setDepartment] = useState(student.department ?? '');
  const [phone, setPhone] = useState(student.phone ?? '');
  const [bio, setBio] = useState(student.bio ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          student_number: student_number.trim(),
          department: department.trim() || null,
          phone: phone.trim() || null,
          bio: bio.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Güncellenemedi');
      onSuccess();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Öğrenci Düzenle</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <Input label="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Öğrenci Numarası" value={student_number} onChange={(e) => setStudentNumber(e.target.value)} />
          <Input label="Bölüm" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Biyografi</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
