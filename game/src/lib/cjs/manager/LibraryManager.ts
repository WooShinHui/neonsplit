declare class AdobeAn {
    static getComposition(composition: string);
}

export class LibraryManager {
    private static _handle: LibraryManager;
    static get Handle(): LibraryManager {
        if (LibraryManager._handle === undefined) {
            LibraryManager._handle = new LibraryManager();
        }
        return LibraryManager._handle;
    }

    private mLibrary: { [name: string]: string | any };

    constructor() {
        this.mLibrary = {};
    }

    getLibrary(fname: string, link?: string): any {
        const lib = this.mLibrary[`${fname}`];
        if (link && typeof lib != 'string') {
            const mc = new lib[link]();
            return mc;
        } else {
            return lib;
        }
    }

    async loadLibrary(productName: string, libray: any): Promise<void> {
        const lib = libray[productName];
        for (const idx in lib) {
            const id = lib[idx].id;
            const src = lib[idx].src;
            const name = lib[idx].name;
            if (this.mLibrary[name] == undefined) {
                await this.loadJsFile(src);
                this.mLibrary[name] = await this.loadAnimate(id, name);
            }
        }
    }

    private async loadJsFile(src: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const themejs = document.createElement('script');
            themejs.setAttribute('src', src);
            document.head.appendChild(themejs);
            themejs.onload = () => {
                resolve();
            };
        });
    }

    private async loadAnimate(id: string, name?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const comp = AdobeAn.getComposition(id);
            const lib = comp.getLibrary();
            const loader = new createjs.LoadQueue(false);
            loader.on('fileload', (evt: any) => {
                const images = comp.getImages();
                if (evt && evt.item.type == 'image') {
                    images[evt.item.id] = evt.result;
                }
            });

            loader.on('complete', (evt: any) => {
                const ss = comp.getSpriteSheet();
                const queue = evt.target;
                const ssMetadata = lib.ssMetadata;
                for (let i = 0; i < ssMetadata.length; i++) {
                    ss[ssMetadata[i].name] = new createjs.SpriteSheet({
                        images: [queue.getResult(ssMetadata[i].name)],
                        frames: ssMetadata[i].frames,
                    });
                }
                resolve(lib);
            });

            if (lib.properties.manifest.length > 0) {
                loader.loadManifest(lib.properties.manifest);
            } else {
                resolve(lib);
            }
        });
    }
}
