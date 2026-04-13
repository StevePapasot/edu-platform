'use client';

import { useState, useEffect } from 'react';
import { X, Save, Settings, Loader2 } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { greekEducationData, findUserGrade, type Category, type Grade } from '@/src/data/greekEducation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  userId: string;
  onUpdate: () => void; // Για να κάνει refresh το Dashboard όταν σώσουμε
}

export function SettingsModal({ isOpen, onClose, userProfile, userId, onUpdate }: SettingsModalProps) {
  const [saving, setSaving] = useState(false);
  
  // States για τις επιλογές
  const [selectedCategory, setSelectedCategory] = useState<Category>(greekEducationData[0]);
  const [selectedGrade, setSelectedGrade] = useState<Grade>(greekEducationData[0].grades[0]);
  const [selectedOrientation, setSelectedOrientation] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Όταν ανοίγει το Modal, "διαβάζει" τις τρέχουσες ρυθμίσεις του χρήστη
  useEffect(() => {
    if (isOpen && userProfile) {
      const gradeInfo = findUserGrade(userProfile.schoolType || '', userProfile.grade || '');
      if (gradeInfo) {
        const cat = greekEducationData.find(c => c.id === gradeInfo.categoryId);
        if (cat) {
          setSelectedCategory(cat);
          const grd = cat.grades.find(g => g.id === gradeInfo.gradeId);
          if (grd) {
            setSelectedGrade(grd);
            setSelectedOrientation(userProfile.orientation || (grd.orientations ? grd.orientations[0].id : null));
            setSelectedSector(userProfile.sector || (grd.sectors ? grd.sectors[0].id : null));
          }
        }
      }
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleCategoryChange = (catId: string) => {
    const cat = greekEducationData.find(c => c.id === catId);
    if (cat) {
      setSelectedCategory(cat);
      setSelectedGrade(cat.grades[0]);
      setSelectedOrientation(cat.grades[0].orientations ? cat.grades[0].orientations[0].id : null);
      setSelectedSector(cat.grades[0].sectors ? cat.grades[0].sectors[0].id : null);
    }
  };

  const handleGradeChange = (grdId: string) => {
    const grd = selectedCategory.grades.find(g => g.id === grdId);
    if (grd) {
      setSelectedGrade(grd);
      setSelectedOrientation(grd.orientations ? grd.orientations[0].id : null);
      setSelectedSector(grd.sectors ? grd.sectors[0].id : null);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        schoolType: selectedCategory.id,
        grade: selectedGrade.id,
        orientation: selectedOrientation,
        sector: selectedSector
      });
      onUpdate(); // Ενημερώνει το Dashboard
      onClose();  // Κλείνει το Modal
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" /> Ρυθμίσεις Προφίλ
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">Τύπος Σχολείου</label>
            <select 
              value={selectedCategory.id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {greekEducationData.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">Τάξη</label>
            <select 
              value={selectedGrade.id}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {selectedCategory.grades.map(grd => (
                <option key={grd.id} value={grd.id}>{grd.name}</option>
              ))}
            </select>
          </div>

          {selectedGrade.orientations && selectedGrade.orientations.length > 0 && (
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">Κατεύθυνση</label>
              <select 
                value={selectedOrientation || ''}
                onChange={(e) => setSelectedOrientation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {selectedGrade.orientations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedGrade.sectors && selectedGrade.sectors.length > 0 && (
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">Τομέας</label>
              <select 
                value={selectedSector || ''}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {selectedGrade.sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ
          </button>
        </div>

      </div>
    </div>
  );
}