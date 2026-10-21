import { debug } from '../../content/strings';
import { LazyUiGallery } from '../ui/gallery/LazyUiGallery';
import { Screen } from '../ui/Screen';
import { DebugControls } from './DebugControls';
import { DebugStatus } from './DebugStatus';

/** Debug-Menü (nur Entwicklungs-Build, siehe app/debug.tsx). */
export function DebugMenu() {
  return (
    <Screen title={debug.title} back>
      <DebugStatus />
      <DebugControls />
      <LazyUiGallery />
    </Screen>
  );
}
