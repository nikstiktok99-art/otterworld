import { useApp, useUi } from './context';
import { DialogPanel } from './Dialog';
import { DecorateBar, Hud, Toasts } from './Hud';
import {
  BagPanel,
  EndCard,
  FriendsPanel,
  MenuPanel,
  NamePanel,
  NoticePanel,
  SaveExportPanel,
  SaveImportPanel,
  TechPanel,
  TitlePanel,
  WorkbenchPanel,
} from './Panels';

export function UiRoot() {
  const u = useUi();
  const { contentErrors } = useApp();
  const kind = u.panel?.kind;
  return (
    <>
      <Hud />
      <Toasts />
      <DecorateBar />
      {kind === 'title' && <TitlePanel />}
      {kind === 'dialog' && <DialogPanel />}
      {kind === 'bag' && <BagPanel />}
      {kind === 'werkbank' && <WorkbenchPanel />}
      {kind === 'menu' && <MenuPanel />}
      {kind === 'friends' && <FriendsPanel />}
      {kind === 'name' && <NamePanel />}
      {kind === 'saveExport' && <SaveExportPanel />}
      {kind === 'saveImport' && <SaveImportPanel />}
      {kind === 'tech' && <TechPanel />}
      {kind === 'endcard' && <EndCard />}
      {kind === 'notice' && <NoticePanel />}
      {import.meta.env.DEV && contentErrors.length > 0 && (
        <div className="dev-errors">
          <strong>Inhaltsfehler ({contentErrors.length})</strong>
          {contentErrors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      )}
    </>
  );
}
