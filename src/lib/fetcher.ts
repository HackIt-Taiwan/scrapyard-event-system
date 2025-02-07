export const fetcher = (url: string) =>
    fetch(url).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch member data");
      return res.json();
    });
  