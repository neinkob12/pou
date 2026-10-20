import { album, common } from '../../content/strings';
import { Placeholder } from '../ui/Placeholder';

/** Fakten-Karten. Gehört P17. */
export function KnowledgeTab() {
  return <Placeholder label={`${album.knowledgeTab}: ${common.comingSoon}`} color="lamp" height={240} />;
}
