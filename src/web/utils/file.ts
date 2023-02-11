export function readFile(file: File): Promise<string | ArrayBuffer | null | undefined> {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.addEventListener("load", (e) => {
      resolve(e.target?.result);
    });
    reader.readAsDataURL(file);
  });
}
