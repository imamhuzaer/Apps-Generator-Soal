export type TipeSoal = "PG" | "PG Kompleks" | "Menjodohkan" | "Essay Singkat" | "Uraian";

export interface SoalItem {
  id?: string;
  tipe: TipeSoal;
  pertanyaan: string;
  indikator?: string;
  levelKognitif?: string;
  needsImage?: boolean;
  opsiA?: string;
  opsiB?: string;
  opsiC?: string;
  opsiD?: string;
  opsiE?: string;
  pasanganData?: string;
  kunciJawaban?: string;
  rubrikPenilaian?: string;
  generatedSvg?: string;
}

export interface GeneratorConfig {
  kurikulum: string;
  fase: string;
  mapel: string;
  materi: string;
  kognitifList: string[];
  jenjang: string;
  kelas: string;
  opsiCountPG: "ABC" | "ABCD" | "ABCDE";
  numPG: number;
  numPGK: number;
  numMenjodohkan: number;
  numEssayS: number;
  numUraian: number;
  incKeys: boolean;
  incImages: boolean;
  incKartu: boolean;
  incRubrik: boolean;
}
