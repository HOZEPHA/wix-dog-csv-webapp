import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mammoth from 'mammoth';
import './style.css';

type DogRecord = {
  pageName: string;
  firstName: string;
  photosLoulous: string;
  featuredPhotos: string;
  raceBirthWeightFaIcad: string;
  frGd: string;
  faIcad: string;
  characterDescription: string;
  adoptionFee: string;
  childrenOk: string;
  animalsOk: string;
  vaccineSterilization: string;
  adoptUrl: string;
  id: string;
  createdDate: string;
  updatedDate: string;
  owner: string;
};

const headers = [
  'Nom de la page',
  'Prénom chien',
  'Photos loulous',
  'Photos à la une',
  'Race / Naissance / Poids / FA / ICAD',
  'FR / GD',
  'FA / N°ICAD',
  'Description caractère loulou',
  "Montant frais d'adoption",
  'Ok/Pas ok Enfants',
  'Ok / Pas ok Congénères',
  'Vaccin / Stérilisation',
  'Loulou à adopter',
  'ID',
  'Created Date',
  'Updated Date',
  'Owner',
];

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function extractName(firstLine: string): string {
  return (firstLine.split(',')[0] ?? firstLine).trim().toUpperCase();
}

function extractRace(firstLine: string): string {
  let race = firstLine.replace(/^\s*[^,]+,\s*/i, '');
  race = race.replace(/\bchiot\b/gi, '');
  race = race.replace(/\bm[âa]le\b/gi, '');
  race = race.replace(/\bfemelle\b/gi, '');
  return race.replace(/\s+/g, ' ').trim().toLocaleLowerCase('fr-FR');
}

function matchOne(text: string, regex: RegExp): string {
  const match = text.match(regex);
  return match?.[1]?.trim() ?? '';
}

function extractWeight(text: string): string {
  const value = matchOne(text, /(?:pèse|pèserai|ferai)\s+(?:environ\s+)?([0-9]+(?:\s*[àa]\s*[0-9]+)?\s*kg)/i);
  return value.replace(/\s+/g, ' ').trim();
}

function extractIcad(text: string): string {
  return matchOne(text, /num[ée]ro\s+([0-9 ]{10,})/i).replace(/\s+/g, ' ').trim();
}

function extractFee(text: string): string {
  return matchOne(text, /(?:Frais d.adoption\s*:\s*|participation de\s*)([0-9]+\s*€)/i).replace(/\s+/g, '').trim();
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function buildQualities(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('calme') || lower.includes('doux') || lower.includes('proche de l’humain') || lower.includes("proche de l'humain")) {
    return 'Je suis doux, calme, proche de l’humain et rempli d’amour';
  }
  if (lower.includes('curieuse') || lower.includes('explorer')) {
    return 'Je suis curieuse, joueuse et pleine d’envie de découvrir le monde';
  }
  if (lower.includes('joueur') || lower.includes('bébés')) {
    return 'Je suis joueur, sociable et plein de vie';
  }
  return 'Je suis affectueux, sociable et plein de vie';
}

function parseDog(textRaw: string): DogRecord {
  const text = normalizeText(textRaw);
  const lines = text.split('\n').map(x => x.trim()).filter(Boolean);
  const fullText = lines.join('\n');
  const firstLine = lines[0] ?? '';

  const name = extractName(firstLine);
  const isFemale = /\b(femelle|née|identifiée|vermifugée|vaccinée|stérilisée)\b/i.test(fullText);
  const sexLabel = isFemale ? 'Femelle' : 'Mâle';
  const sexNoun = isFemale ? 'femelle' : 'mâle';
  const bornWord = isFemale ? 'Née' : 'Né';
  const race = extractRace(firstLine);
  const birthDate = matchOne(fullText, /\b(?:né|née)\s+le\s+(\d{2}\/\d{2}\/\d{4})/i);
  const weight = extractWeight(fullText);
  const icad = extractIcad(fullText);
  const fee = extractFee(fullText);

  const raceLines = [`${sexLabel} ${race}`, `${bornWord} le ${birthDate}`];
  if (weight) raceLines.push(`Poids estimé : ${weight}`);

  const okChildren = /ok\s+enfants?/i.test(fullText) ? "💚 J'aime les enfants" : '';
  const okCongeneres = /ok\s+cong[ée]n[èe]res?/i.test(fullText);
  const okChats = /ok\s+chats?/i.test(fullText);
  let animalsOk = '';
  if (okCongeneres && okChats) animalsOk = "💚 Je m'entends bien avec mes congénères et les chats";
  else if (okCongeneres) animalsOk = "💚 Je m'entends bien avec mes congénères";
  else if (okChats) animalsOk = "💚 Je m'entends bien avec les chats";

  const sterilized = /st[ée]rilis[ée]/i.test(fullText);
  const vaccineSterilization = sterilized
    ? isFemale
      ? '✅ Je suis vermifugée, vaccinée et stérilisée.'
      : '✅ Je suis vermifugé, vacciné et stérilisé.'
    : isFemale
      ? '✅ Je suis vermifugée et primo-vaccinée. Stérilisation à prévoir.'
      : '✅ Je suis vermifugé et primo-vacciné. Stérilisation à prévoir.';

  const characterDescription = `Je m’appelle ${name}, je suis un chiot ${sexNoun} ${race} 🐶✨\n\n${buildQualities(fullText)} 💕\n\nJ’adore partager des moments de tendresse, jouer et être près de mon humain 🥰\n\nAvec moi, vous aurez un compagnon fidèle pour la vie.`;

  return {
    pageName: name,
    firstName: name,
    photosLoulous: '',
    featuredPhotos: '',
    raceBirthWeightFaIcad: raceLines.join('\n'),
    frGd: '',
    faIcad: `✈️ Actuellement en famille d'accueil en Guadeloupe, j'arrive bientôt en métropole\n\nIdentification : ${icad}`,
    characterDescription,
    adoptionFee: fee,
    childrenOk: okChildren,
    animalsOk,
    vaccineSterilization,
    adoptUrl: `/loulous-a-adopter/${slugify(name)}`,
    id: '',
    createdDate: '',
    updatedDate: '',
    owner: '',
  };
}

function escapeCsv(value: string): string {
  const cleaned = (value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const escaped = cleaned.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function toCsv(records: DogRecord[]): string {
  const rows = [headers.map(escapeCsv).join(',')];
  for (const dog of records) {
    rows.push([
      dog.pageName,
      dog.firstName,
      dog.photosLoulous,
      dog.featuredPhotos,
      dog.raceBirthWeightFaIcad,
      dog.frGd,
      dog.faIcad,
      dog.characterDescription,
      dog.adoptionFee,
      dog.childrenOk,
      dog.animalsOk,
      dog.vaccineSterilization,
      dog.adoptUrl,
      dog.id,
      dog.createdDate,
      dog.updatedDate,
      dog.owner,
    ].map(escapeCsv).join(','));
  }
  return '\ufeff' + rows.join('\n');
}

async function readDocxFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

function App() {
  const [records, setRecords] = useState<DogRecord[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const canDownload = records.length > 0;

  const csv = useMemo(() => toCsv(records), [records]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setLogs([]);
    const next: DogRecord[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.name.toLowerCase().endsWith('.docx')) {
          setLogs(prev => [...prev, `Ignoré : ${file.name} n'est pas un .docx`]);
          continue;
        }
        const text = await readDocxFile(file);
        const dog = parseDog(text);
        next.push(dog);
        setLogs(prev => [...prev, `OK : ${file.name} → ${dog.firstName}`]);
      }
      setRecords(next);
    } catch (error) {
      setLogs(prev => [...prev, `ERREUR : ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setBusy(false);
    }
  }

  function downloadCsv() {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loulous_wix_adoption.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>Générateur CSV Wix</h1>
        <p>Transforme des fiches chiens Word .docx en CSV importable dans Wix. Les fichiers restent dans le navigateur.</p>
      </section>

      <section className="panel">
        <label className="dropzone">
          <input type="file" multiple accept=".docx" onChange={e => handleFiles(e.target.files)} disabled={busy} />
          <strong>{busy ? 'Lecture en cours...' : 'Sélectionner les documents Word'}</strong>
          <span>Formats acceptés : .docx</span>
        </label>

        <div className="actions">
          <button onClick={downloadCsv} disabled={!canDownload}>Télécharger le CSV Wix</button>
          <button className="secondary" onClick={() => { setRecords([]); setLogs([]); }} disabled={busy}>Réinitialiser</button>
        </div>
      </section>

      {logs.length > 0 && (
        <section className="panel">
          <h2>Journal</h2>
          <ul className="logs">{logs.map((log, i) => <li key={i}>{log}</li>)}</ul>
        </section>
      )}

      {records.length > 0 && (
        <section className="panel">
          <h2>Prévisualisation</h2>
          <div className="tableWrap">
            <table>
              <thead><tr><th>Nom</th><th>Infos</th><th>ICAD</th><th>Frais</th><th>URL Wix</th></tr></thead>
              <tbody>
                {records.map(dog => (
                  <tr key={dog.firstName}>
                    <td>{dog.firstName}</td>
                    <td><pre>{dog.raceBirthWeightFaIcad}</pre></td>
                    <td><pre>{dog.faIcad}</pre></td>
                    <td>{dog.adoptionFee}</td>
                    <td>{dog.adoptUrl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
