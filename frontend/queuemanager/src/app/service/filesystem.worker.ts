/// <reference lib="webworker" />

async function *getFilesRecursively(rootHandle: FileSystemDirectoryHandle, entry: any) {
	if (entry.kind === "file") {
		const file = await entry.getFile();
		if (file !== null) {
			let pathArray = await rootHandle.resolve(entry);
			file.relativePath = pathArray!.join("/");
			yield file;
		}
	} else if (entry.kind === "directory") {
		for await (const handle of entry.values()) {
			yield* getFilesRecursively(rootHandle, handle);
		}
	}
}

async function scan(rootHandle: FileSystemDirectoryHandle, entry: any) {
	let result = {}; 
	let itr = await getFilesRecursively(rootHandle, entry);
	for await (const file of itr) {
		result[file.relativePath] = {
			size: file.size,
			lastModified: file.lastModified
		}
	}
	return result;
}

addEventListener('message', async ({ data }) => {
	if (data.cmd == "getFilesRecursively") {
		let result = await scan(data.rootHandle, data.handle);
		postMessage({
			cmd: "getFilesRecursively",
			result: result
		})
	}
});
