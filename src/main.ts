const plugin = require("../plugin.json");
import AcodePlugin from './acodePlugin';

if (window.acode) {
    const acodePlugin = new AcodePlugin();

    acode.setPluginInit(
        plugin.id,
        async (baseUrl: string, $page: HTMLElement,
           {
              cacheFileUrl,
              cacheFile
           }: {
              cacheFileUrl:
              string,
              cacheFile: string
           }
         ): Promise<void> => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            acodePlugin.baseUrl = baseUrl;
            await acodePlugin.init();
        }
    );
    
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}
