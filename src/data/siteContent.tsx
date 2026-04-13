import React from 'react';
import { Compass, BookOpen, Target, Zap, Sparkles } from 'lucide-react';

export const faqs = [
  {
    q: "Πώς μπορώ να ξεκινήσω την εγγραφή μου;",
    a: "Είναι πολύ απλό! Πατάς το κουμπί 'Είσοδος' πάνω δεξιά ή το 'Ξεκίνησε τη Μάθηση' στο κέντρο της σελίδας και δημιουργείς τον λογαριασμό σου δωρεάν."
  },
  {
    q: "Είναι η πλατφόρμα δωρεάν για όλους;",
    a: "Ναι! Η πρόσβαση στα βασικά εργαλεία και την ύλη είναι δωρεάν. Ορισμένοι οργανισμοί και φροντιστήρια παρέχουν επιπλέον υλικό αποκλειστικά για τους μαθητές τους."
  },
  {
    q: "Πώς μπορώ να παρακολουθήσω τα Live Μαθήματα;",
    a: "Αφού συνδεθείς στο Dashboard σου, θα βρεις την ενότητα 'Ζωντανά Μαθήματα'. Εκεί εμφανίζονται οι σύνδεσμοι για τις αίθουσες την ώρα που το μάθημα είναι ενεργό."
  },
  {
    q: "Αποθηκεύεται η πρόοδός μου αυτόματα;",
    a: "Φυσικά! Κάθε φορά που ολοκληρώνεις μια ενότητα ή ένα βίντεο, η πλατφόρμα ενημερώνει το ποσοστό προόδου σου, το οποίο μπορείς να δεις στο προσωπικό σου Dashboard."
  }
];

export const guidanceSlides = [
  {
    tag: 'ΟΔΗΓΟΣ',
    title: 'Πώς να χρησιμοποιήσεις την Πλατφόρμα',
    icon: Compass,
    color: 'text-blue-400',
    bgBadge: 'bg-blue-500/20',
    content: (
      <ul className="space-y-5 text-white/90 font-medium text-lg leading-relaxed">
        <li className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold flex-shrink-0 border border-blue-500/30">1</div>
          <p>Διάλεξε την τάξη και την κατεύθυνσή σου από το μενού της αρχικής σελίδας.</p>
        </li>
        <li className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold flex-shrink-0 border border-blue-500/30">2</div>
          <p>Κάνε κλικ στο μάθημα που θέλεις για να δεις όλη την ύλη οργανωμένη σε κεφάλαια.</p>
        </li>
        <li className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold flex-shrink-0 border border-blue-500/30">3</div>
          <p>Κάνε Εγγραφή (είναι δωρεάν), για να αποθηκεύεται η πρόοδός σου στο προσωπικό σου Dashboard!</p>
        </li>
      </ul>
    )
  },
  {
    tag: 'ΣΥΜΒΟΥΛΗ',
    title: 'Tips Διαβάσματος',
    icon: BookOpen,
    color: 'text-emerald-400',
    bgBadge: 'bg-emerald-500/20',
    content: (
      <ul className="space-y-5 text-white/90 font-medium text-lg leading-relaxed">
        <li className="flex gap-3">
          <span className="text-emerald-400">❖</span>
          <p>Κάνε διαλείμματα. Δοκίμασε τον κανόνα &quot;25 λεπτά διάβασμα, 5 λεπτά διάλειμμα&quot; (Τεχνική Pomodoro).</p>
        </li>
        <li className="flex gap-3">
          <span className="text-emerald-400">❖</span>
          <p>Μην παπαγαλίζεις! Προσπάθησε να εξηγήσεις αυτό που διάβασες με δικά σου λόγια, σαν να το διδάσκεις σε κάποιον άλλον.</p>
        </li>
        <li className="flex gap-3">
          <span className="text-emerald-400">❖</span>
          <p>Κλείσε το κινητό ή βάλ&apos; το σε άλλο δωμάτιο όσο διαβάζεις για να διατηρήσεις την απόλυτη συγκέντρωση.</p>
        </li>
      </ul>
    )
  },
  {
    tag: 'ΣΥΜΒΟΥΛΗ',
    title: 'Tips για Εξετάσεις',
    icon: Target,
    color: 'text-rose-400',
    bgBadge: 'bg-rose-500/20',
    content: (
      <ul className="space-y-5 text-white/90 font-medium text-lg leading-relaxed">
        <li className="flex gap-3">
          <span className="text-rose-400">❖</span>
          <p>Διάβασε πολύ προσεκτικά την εκφώνηση 2 φορές πριν αρχίσεις να γράφεις. Πολλά λάθη γίνονται από βιασύνη.</p>
        </li>
        <li className="flex gap-3">
          <span className="text-rose-400">❖</span>
          <p>Αν κολλήσεις σε ένα θέμα, μην πανικοβάλλεσαι! Προχώρα στο επόμενο και γύρνα πίσω αργότερα με καθαρό μυαλό.</p>
        </li>
        <li className="flex gap-3">
          <span className="text-rose-400">❖</span>
          <p>Ο καλός ύπνος το βράδυ πριν την εξέταση είναι 100 φορές πιο σημαντικός από 2 ώρες έξτρα ξενύχτι και διάβασμα!</p>
        </li>
      </ul>
    )
  },
  { tag: 'ΜΑΘΗΜΑΤΙΚΑ', title: 'Το Ήξερες Ότι;', icon: Zap, color: 'text-yellow-400', bgBadge: 'bg-yellow-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Ο αριθμός &quot;Μηδέν&quot; (0) επινοήθηκε στην Ινδία περίπου τον 5ο αιώνα μ.Χ. Πριν από αυτό, οι πολιτισμοί απλώς άφηναν ένα κενό διάστημα στους υπολογισμούς τους!</p> },
  { tag: 'ΙΣΤΟΡΙΑ', title: 'Το Ήξερες Ότι;', icon: Sparkles, color: 'text-sky-400', bgBadge: 'bg-sky-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Ο Μέγας Αλέξανδρος δεν έχασε ποτέ καμία μάχη σε ολόκληρη τη ζωή του, δημιουργώντας μία από τις μεγαλύτερες αυτοκρατορίες που γνώρισε ποτέ ο κόσμος!</p> },
  { tag: 'ΦΥΣΙΚΗ', title: 'Το Ήξερες Ότι;', icon: Zap, color: 'text-yellow-400', bgBadge: 'bg-yellow-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Το φως ταξιδεύει τόσο γρήγορα (300.000 χλμ/δευτερόλεπτο) που χρειάζεται μόνο 8 λεπτά και 20 δευτερόλεπτα για να φτάσει από τον Ήλιο μέχρι τη Γη!</p> },
  { tag: 'ΑΡΧΑΙΑ ΕΛΛΗΝΙΚΑ', title: 'Το Ήξερες Ότι;', icon: Sparkles, color: 'text-sky-400', bgBadge: 'bg-sky-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Το ελληνικό αλφάβητο προήλθε από το φοινικικό. Όμως, οι Έλληνες ήταν οι πρώτοι στον κόσμο που πρόσθεσαν γράμματα αποκλειστικά για τα Φωνήεντα!</p> },
  { tag: 'ΒΙΟΛΟΓΙΑ', title: 'Το Ήξερες Ότι;', icon: Zap, color: 'text-yellow-400', bgBadge: 'bg-yellow-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Το DNA σου είναι κατά 99,9% ολόιδιο με το DNA οποιουδήποτε άλλου ανθρώπου στη Γη. Όλη η μοναδικότητά σου κρύβεται στο υπόλοιπο 0,1%!</p> },
  { tag: 'ΧΗΜΕΙΑ', title: 'Το Ήξερες Ότι;', icon: Sparkles, color: 'text-sky-400', bgBadge: 'bg-sky-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Το γυαλί (π.χ. στα παράθυρα) είναι φτιαγμένο κυρίως από απλή άμμο! Η άμμος θερμαίνεται σε ακραίες θερμοκρασίες (περίπου 1700°C) μέχρι να λιώσει και να γίνει υγρή.</p> },
  { tag: 'ΠΛΗΡΟΦΟΡΙΚΗ', title: 'Το Ήξερες Ότι;', icon: Zap, color: 'text-yellow-400', bgBadge: 'bg-yellow-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Ο πρώτος άνθρωπος που έγραψε κώδικα υπολογιστή στην ιστορία δεν ήταν άντρας, αλλά γυναίκα! Η Άντα Λάβλεϊς τον 19ο αιώνα.</p> },
  { tag: 'ΛΟΓΟΤΕΧΝΙΑ', title: 'Το Ήξερες Ότι;', icon: Sparkles, color: 'text-sky-400', bgBadge: 'bg-sky-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Η Ελλάδα έχει κερδίσει δύο βραβεία Νόμπελ Λογοτεχνίας! Το πρώτο το πήρε ο Γιώργος Σεφέρης (1963) και το δεύτερο ο Οδυσσέας Ελύτης (1979).</p> },
  { tag: 'ΓΕΩΓΡΑΦΙΑ', title: 'Το Ήξερες Ότι;', icon: Zap, color: 'text-yellow-400', bgBadge: 'bg-yellow-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Η Ελλάδα, αν και μικρή χώρα σε έκταση, έχει τη μεγαλύτερη ακτογραμμή σε ολόκληρη τη Μεσόγειο (περίπου 13.676 χιλιόμετρα) λόγω των χιλιάδων νησιών της!</p> },
  { tag: 'ΟΙΚΟΝΟΜΙΑ', title: 'Το Ήξερες Ότι;', icon: Sparkles, color: 'text-sky-400', bgBadge: 'bg-sky-500/20', content: <p className="text-xl text-white/90 leading-relaxed font-medium">Τα πρώτα νομίσματα στον κόσμο φτιάχτηκαν στο βασίλειο της Λυδίας (στη Μικρά Ασία) γύρω στο 600 π.Χ. από ένα κράμα χρυσού και αργύρου που λεγόταν &quot;ήλεκτρον&quot;.</p> }
];