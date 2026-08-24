import { render } from 'preact';
import { TournamentPanel } from '../src/ui/TournamentPanel';
import { observeFastcupPage } from '../src/fastcup/observer';

export default defineContentScript({
  matches: ['https://cs2.fastcup.net/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'fastcup-scout-panel',
      position: 'inline',
      anchor: 'body',
      onMount(container) {
        render(<TournamentPanel />, container);
        return container;
      },
      onRemove(container) {
        if (container) render(null, container);
      },
    });

    observeFastcupPage(() => console.debug('FASTCUP content changed'));
    ui.mount();
  },
});
