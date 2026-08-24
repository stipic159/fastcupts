export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    console.info('FASTCUP Tournament Scout installed');
  });
});
