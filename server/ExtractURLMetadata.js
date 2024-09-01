import openGraph from "open-graph-scraper";

// handle links in the chats: Render their metaData properly
export const linkify = async (chat) => {
  // Split the chat text by spaces to process each word separately
  const arrayOfChat = chat.split(" ");

  // Regular expression to match URLs
  const urlRegex = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  );

  // Process each word
  const processedChat = await Promise.all(
    arrayOfChat.map(async (word) => {
      if (word.match(urlRegex)) {
        // If the word is a URL, fetch metadata
        const metadata = await fetchLinkMetadata(word);

        // Construct the HTML for the link and its metadata
        return `
        <div class="link-preview">
          <a href="${word}" target="_blank">${word}</a>
          ${metadata ? renderMetadata(metadata) : ""}
        </div>`;
      } else {
        // If the word is not a URL, return it as is
        return word;
      }
    })
  );

  // Join the processed words back into a string with spaces
  return processedChat.join(" ");
};

// Fetch metadata for a URL
export const fetchLinkMetadata = async (url) => {
  try {
    const options = { url: url };
    const data = await openGraph(options);
    const { result } = data;
    const metadata = {
      title: result?.ogTitle,
      description: result?.ogDescription,
      image: result?.ogImage[0]?.url,
      videoUrl: result?.ogVideo[0]?.url,
    };
    return metadata;
  } catch (error) {
    console.log("Error fetching metadata from URL");
    return undefined;
  }
};

//Render metadata properly
export const renderMetadata = (metadata) => {
  if (!metadata) return "";

  const { title, description, image, videoUrl } = metadata;

  return `
    <div class="metadata">
      ${image ? `<img src="${image}" alt="Preview Image">` : ""}
      ${title ? `<h4>${title}</h4>` : ""}
      ${description ? `<p>${description}</p>` : ""}
      ${
        videoUrl
          ? `<iframe width="560" height="315" src="${videoUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
          : ""
      }
    </div>`;
};
