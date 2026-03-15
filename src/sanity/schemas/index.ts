import blockContent, { youtube, videoFile } from './blockContent';
import category from './category';
import tutorial from './tutorial';
import leerpad from './leerpad';
import module from './module';
import quizVraag from './quizVraag';
import opdracht, { criteriumType } from './opdracht';
import twoColumn from './twoColumn';

export const schemaTypes = [
  blockContent, 
  tutorial, 
  category, 
  leerpad, 
  module, 
  quizVraag, 
  youtube, 
  videoFile,
  opdracht,
  criteriumType,
  twoColumn,
];
