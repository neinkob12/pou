import { album, common } from '../../content/strings';
import { Placeholder } from '../ui/Placeholder';

/** Sorten-Sammlung. Gehört P16. */
export function StrainsTab() {
  return <Placeholder label={`${album.strainsTab}: ${common.comingSoon}`} color="plantLight" height={240} />;
}
