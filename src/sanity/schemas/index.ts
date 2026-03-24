import blockContent, { youtube, videoFile, pdfFile } from './blockContent';
import category from './category';
import tutorial from './tutorial';
import leerpad from './leerpad';
import module from './module';
import quizVraag from './quizVraag';
import opdracht, { criteriumType } from './opdracht';
import twoColumn from './twoColumn';
import customImage from './customImage';
import accordionSection from './accordionSection';

export const schemaTypes = [
  blockContent,
  tutorial,
  category,
  leerpad,
  module,
  quizVraag,
  youtube,
  videoFile,
  pdfFile,
  opdracht,
  criteriumType,
  twoColumn,
  customImage,
  accordionSection,
];
