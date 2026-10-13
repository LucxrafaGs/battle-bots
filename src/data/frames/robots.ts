import type { RobotPreset } from '@/types/content';

/* Robôs prontos: combinações completas exibidas no montador. */
export const ROBOT_PRESETS: RobotPreset[] = [
  {
    id: 'original',
    name: 'Robo 02 — original',
    summary: 'Projeto base com baía para arma vertical',
    modules: { lateral1: 'L1-01', lateral2: 'L2-01', frame: 'FC-01', tampa: 'TP-01' },
  },
  {
    id: 'barra',
    name: 'Barra horizontal',
    summary: 'Barra giratória sobre a tampa, A2212 na baía',
    modules: { lateral1: 'L1-02', lateral2: 'L2-02', frame: 'FC-02', tampa: 'TP-02' },
  },
  {
    id: 'disco',
    name: 'Disco horizontal',
    summary: 'Disco Ø140 com dois dentes, A2212 na baía',
    modules: { lateral1: 'L1-04', lateral2: 'L2-04', frame: 'FC-03', tampa: 'TP-03' },
  },
  {
    id: 'tambor',
    name: 'Tambor',
    summary: 'Tambor frontal com o A2212 dentro dele',
    modules: { lateral1: 'L1-03', lateral2: 'L2-03', frame: 'FC-04', tampa: 'TP-02' },
  },
  {
    id: 'martelo',
    name: 'Martelo',
    summary: 'Martelo acionado por servo MG996R',
    modules: { lateral1: 'L1-05', lateral2: 'L2-05', frame: 'FC-05', tampa: 'TP-04' },
  },
];
