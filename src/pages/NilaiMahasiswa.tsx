import Footer from '@/components/Footer';
import Topbar from '@/components/Topbar';
import { useNilaiMhsStore } from '@/store/useNilaiMhsStore';
import type { NilaiMhs as typeNilaiMhs } from '@/types';
import { useState } from 'react';
import { FiSearch, FiCalendar, FiBook, FiInfo, FiAlertCircle, FiChevronDown } from 'react-icons/fi';

const NilaiMahasiswa = () => {
  const { periodeNilaiMhs, getPeriode, NilaiMhs, getNilai, isLoadingNilai, getNilaiPrint } = useNilaiMhsStore();

  // Get NIM from local storage if available
  const [formData, setFormData] = useState({
    nim: localStorage.getItem('mhs') !== null ? JSON.parse(localStorage.getItem('mhs') ?? '').id : '',
    periode: '',
    jenis: 'nilai_tengah_semester'
  });

  const [activeSemester, setActiveSemester] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const jenisOptions = [
    { value: 'nilai_tengah_semester', label: 'UTS' },
    { value: 'nilai_akhir_semester', label: 'UAS' },
  ];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nim: formData.nim,
      periode: formData.periode,
      jenis: formData.jenis
    };
    getNilai(payload);
  };

  // Handle get Transkrip
  const handleCetakNilai = async (typePrint: "transkrip" | "khs") => {
    const payload = {
      nim: formData.nim,
      periode: formData.periode,
      jenis: formData.jenis,
    };
    await getNilaiPrint(payload, typePrint, true);
  };
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle course details
  const toggleCourseDetails = (id: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCourses(newExpanded);
  };

  // Group by semester
  const groupedBySemester = NilaiMhs?.reduce((acc, item) => {
    const semester = item.Semester;
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(item);
    return acc;
  }, {} as Record<string, typeof NilaiMhs>);

  // Check if all values are zero or empty
  const isAllValuesEmpty = (item: typeNilaiMhs) => {
    return (
      (!item.Absensi || item.Absensi === 0 || item.Absensi.toString() === '-') &&
      (!item.Tugas || item.Tugas === 0 || item.Tugas.toString() === '-') &&
      (!item.UTS || item.UTS === 0 || item.UTS.toString() === '-') &&
      (!item.UAS || item.UAS === 0 || item.UAS.toString() === '-') &&
      (!item.Praktikum || item.Praktikum === 0 || item.Praktikum === '-')
    );
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Topbar />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary flex items-center gap-2">
          <FiBook className="inline" /> Nilai Mahasiswa
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NIM Input */}
            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <FiSearch /> NIM Mahasiswa
                </span>
              </label>
              <div className='join'>
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleChange}
                  placeholder="Masukkan NIM"
                  className="input input-bordered w-full join-item"
                  required
                />
                <button
                  type="button"
                  className='btn btn-primary join-item'
                  onClick={() => {
                    getPeriode(formData.nim);
                  }}
                >
                  Ambil Periode
                </button>
              </div>
            </div>

            {periodeNilaiMhs && (
              <>
                {/* Periode Select */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FiCalendar /> Periode Akademik
                    </span>
                  </label>
                  <select
                    name="periode"
                    value={formData.periode}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Pilih Periode</option>
                    {periodeNilaiMhs.data.map((option, index) => (
                      <option key={index} value={option.periode}>
                        Periode - {option.periode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Jenis Nilai</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {jenisOptions.map(option => (
                      <label key={option.value} className="label cursor-pointer flex items-center gap-2">
                        <input
                          type="radio"
                          name="jenis"
                          value={option.value}
                          checked={formData.jenis === option.value}
                          onChange={handleChange}
                          className="radio radio-primary"
                        />
                        <span className="label-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                {!NilaiMhs && (
                  <div className="pt-4">
                    <button type="submit" className="btn btn-primary w-full"
                      disabled={!formData.nim || !formData.periode || !formData.jenis}
                    >
                      Cari Nilai
                    </button>
                  </div>
                )}
              </>
            )}
          </form>
          {NilaiMhs && formData.jenis === 'nilai_akhir_semester' && (
            <div className="join flex w-full sm:justify-end mt-4">
              <button className="btn flex-1 sm:flex-none join-item btn-success"
                onClick={() => handleCetakNilai('transkrip')}>
                Cetak Transkrip <span className='hidden md:inline'>Nilai</span>
              </button>
              <button className="btn flex-1 sm:flex-none join-item btn-info"
                onClick={() => handleCetakNilai('khs')}>
                Cetak KHS <span className='hidden md:inline'>Nilai</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">

          <div className='mb-4 flex flex-col md:flex-row items-start justify-between'>
            <h2 className="text-lg sm:text-xl font-semibold">Nilai Periode {formData.periode}</h2>
            <span className="text-sm text-gray-500 md:hidden">
              Ketuk mata kuliah untuk melihat detail
            </span>
          </div>

          {isLoadingNilai ? (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-4">Memuat data nilai...</p>
            </div>
          ) : NilaiMhs?.length ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Kode</th>
                      <th>Mata Kuliah</th>
                      <th>SKS</th>
                      <th>Absensi</th>
                      <th>Tugas</th>
                      <th>UTS</th>
                      {formData.jenis === 'nilai_akhir_semester' && (
                        <>
                          <th>UAS</th>
                          <th>Praktikum</th>
                          <th>Total</th>
                          <th>Grade</th>
                          <th>Nilai Grade</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {NilaiMhs.map((item) => (
                      <tr key={item.id} className="hover:bg-base-100">
                        <td>{item.Kode}</td>
                        <td>
                          <div className="font-medium">{item.Matakuliah}</div>
                          <div className="text-sm text-gray-500">{item.English}</div>
                        </td>
                        <td>{item.SKS}</td>
                        <td>{item.Absensi.toString() !== '-' ? `${item.Absensi}%` : item.Absensi}</td>
                        <td>{item.Tugas}</td>
                        <td>{item.UTS}</td>
                        {formData.jenis === 'nilai_akhir_semester' && (
                          <>
                            <td>{item.UAS}</td>
                            <td>{item.Praktikum}</td>
                            <td className="font-semibold">{item.Total}</td>
                            <td>
                              <span className={`badge ${item.Grade.startsWith('A') ? 'badge-accent' :
                                item.Grade.startsWith('B') ? 'badge-success' :
                                  item.Grade.startsWith('C') ? 'badge-warning' :
                                    'badge-secondary'
                                }`}>
                                {item.Grade}
                              </span>
                            </td>
                            <td>{item.Nilai}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {NilaiMhs.some(item => item.Kumulatif) && (
                    <tfoot>
                      <tr className="bg-base-200 font-semibold">
                        <td colSpan={2}>Total Kumulatif</td>
                        <td>{NilaiMhs[0]?.Kumulatif}</td>
                        <td colSpan={7}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {Object.entries(groupedBySemester || {}).map(([semester, courses]) => (
                  <div key={semester} className="collapse collapse-arrow bg-base-100 border border-base-300">
                    <input
                      type="checkbox"
                      checked={activeSemester === semester}
                      onChange={() => setActiveSemester(activeSemester === semester ? null : semester)}
                    />
                    <div className="collapse-title text-lg font-medium">
                      Semester {semester}
                    </div>
                    <div className="collapse-content">
                      <div className="space-y-3">
                        {courses.map((item) => (
                          <div
                            key={item.id}
                            className={`card bg-base-100 shadow ${isAllValuesEmpty(item) ? 'border border-warning' : ''}`}
                            onClick={() => toggleCourseDetails(item.id.toString())}
                          >
                            <div className="card-body p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="card-title text-base">{item.Matakuliah}</h3>
                                  <p className="text-sm text-gray-500">{item.Kode} • {item.SKS} SKS</p>
                                </div>
                                {formData.jenis === 'nilai_akhir_semester' && (
                                  <span className={`badge ${item.Grade.startsWith('A') ? 'badge-accent' :
                                    item.Grade.startsWith('B') ? 'badge-success' :
                                      item.Grade.startsWith('C') ? 'badge-warning' :
                                        'badge-secondary'
                                    }`}>
                                    {item.Grade}
                                  </span>
                                )}
                              </div>

                              {isAllValuesEmpty(item) && (
                                <div className="alert alert-warning mt-2 py-2">
                                  <FiAlertCircle />
                                  <span className="text-sm">Komponen nilai belum diinputkan</span>
                                </div>
                              )}

                              {expandedCourses.has(item.id.toString()) && (
                                <div className="mt-3 pt-3 border-t border-base-200">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium mr-1">Absensi:</span>
                                      {item.Absensi.toString() !== '-' ? `${item.Absensi}%` : item.Absensi}
                                    </div>
                                    <div>
                                      <span className="font-medium mr-1">Tugas:</span> {item.Tugas}
                                    </div>
                                    <div>
                                      <span className="font-medium mr-1">UTS:</span> {item.UTS}
                                    </div>
                                    {formData.jenis === 'nilai_akhir_semester' && (
                                      <>
                                        <div>
                                          <span className="font-medium mr-1">UAS:</span> {item.UAS}
                                        </div>
                                        <div>
                                          <span className="font-medium mr-1">Praktikum:</span> {item.Praktikum}
                                        </div>
                                        <div>
                                          <span className="font-medium mr-1">Total:</span> {item.Total}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                              {!expandedCourses.has(item.id.toString()) && (
                                <div className="mt-2 text-sm">
                                  <div className="flex justify-between">
                                    <div>
                                      <span className='font-medium mr-1'>Absensi:</span>
                                      {item.Absensi.toString() !== '-' ? `${item.Absensi}%` : item.Absensi}</div>
                                    <div>
                                      <span className='font-medium mr-1'>Tugas:</span>
                                      {item.Tugas}</div>
                                    <div>
                                      <span className='font-medium mr-1'>UTS:</span>
                                      {item.UTS}</div>
                                  </div>
                                  {formData.jenis === 'nilai_akhir_semester' && (
                                    <div className="flex justify-between mt-1">
                                      <div>
                                        <span className='font-medium mr-1'>UAS:</span>
                                        {item.UAS}</div>
                                      <div>
                                        <span className='font-medium mr-1'>Total:</span>
                                        {item.Total}</div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="card-actions justify-between mt-2">
                                {expandedCourses.has(item.id.toString()) ? (
                                  <div>
                                    <span className="font-medium mr-1">Nilai Grade:</span> {item.Nilai}
                                  </div>
                                ) : <div></div>}
                                <button
                                  className="btn btn-xs bg-indigo-500 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCourseDetails(item.id.toString());
                                  }}
                                >
                                  <FiChevronDown />
                                  {expandedCourses.has(item.id.toString()) ? 'Sembunyikan' : 'Detail'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <FiInfo className="inline-block text-2xl mb-2" />
                <p>Masukkan NIM dan pilih periode untuk melihat nilai</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NilaiMahasiswa;