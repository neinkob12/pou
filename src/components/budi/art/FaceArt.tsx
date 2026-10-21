import { Group } from '@shopify/react-native-skia';

import type { BudiFace } from '../budiLook';
import { Extras } from './FaceExtras';
import { Eyes, Pupils } from './FaceEyes';
import { Mouth } from './FaceMouth';
import { FACES } from './faceSpec';

export { EYE_Y, MOUTH_Y } from './faceSpec';

export type FacePart = 'eyes' | 'pupils' | 'mouth' | 'rest';

interface FaceArtProps {
  face: BudiFace;
  /**
   * Jede Ebene liegt auf einer eigenen stillen Leinwand: Blinzeln (eyes), Umschauen (pupils) und
   * Kauen oder Gähnen (mouth) laufen als View-Transform, keine Leinwand zeichnet pro Frame neu.
   */
  part: FacePart;
}

/** Budis Gesicht je Mimik (B10 plus ART-3), gezeichnet statt Bild-Ebene. */
export function FaceArt({ face, part }: FaceArtProps) {
  const spec = FACES[face];
  switch (part) {
    case 'eyes':
      return <Eyes kind={spec.eyes} />;
    case 'pupils':
      return <Pupils kind={spec.eyes} />;
    case 'mouth':
      return <Mouth kind={spec.mouth} />;
    case 'rest':
      return (
        <Group>
          <Extras extras={spec.extras} />
        </Group>
      );
  }
}
