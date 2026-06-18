export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

export function calculateReadingTime(wordCount) {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function countWords(html) {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export function extractPlainText(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function calculateFleschReadingEase(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  const vowels = 'aeiouy';
  let syllableCount = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    previousWasVowel = isVowel;
  }

  if (word.endsWith('e')) {
    syllableCount--;
  }

  return Math.max(1, syllableCount);
}

export function analyzeSEO(
  title,
  metaDescription,
  content,
  focusKeyword
) {
  const issues = [];
  const recommendations = [];
  let score = 100;

  const plainText = extractPlainText(content).toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const keyword = (focusKeyword || '').toLowerCase();

  if (!title || title.length < 30 || title.length > 60) {
    issues.push(`Title length is ${title ? title.length : 0} characters (optimal: 50-60)`);
    score -= 10;
  }

  if (!metaDescription || metaDescription.length < 120 || metaDescription.length > 160) {
    issues.push(`Meta description is ${metaDescription ? metaDescription.length : 0} characters (optimal: 150-160)`);
    score -= 10;
  }

  if (keyword && !titleLower.includes(keyword)) {
    issues.push('Focus keyword not found in title');
    score -= 15;
  }

  if (keyword && metaDescription && !metaDescription.toLowerCase().includes(keyword)) {
    issues.push('Focus keyword not found in meta description');
    score -= 10;
  }

  const keywordCount = keyword ? (plainText.match(new RegExp(keyword, 'g')) || []).length : 0;
  const wordCount = countWords(content);
  const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

  if (keyword && keywordDensity < 0.5) {
    issues.push('Keyword density too low (< 0.5%)');
    score -= 10;
    recommendations.push('Use the focus keyword more naturally throughout the content');
  } else if (keyword && keywordDensity > 2.5) {
    issues.push('Keyword density too high (> 2.5%, risk of keyword stuffing)');
    score -= 15;
    recommendations.push('Reduce keyword usage to avoid keyword stuffing');
  }

  if (wordCount < 300) {
    issues.push(`Content is too short (${wordCount} words, minimum: 300)`);
    score -= 20;
  }

  const h1Count = content ? (content.match(/<h1[^>]*>/gi) || []).length : 0;
  const h2Count = content ? (content.match(/<h2[^>]*>/gi) || []).length : 0;

  if (h1Count > 1) {
    issues.push('Multiple H1 tags found (should only have one)');
    score -= 10;
  }

  if (h2Count === 0) {
    issues.push('No H2 headings found');
    score -= 10;
    recommendations.push('Add H2 headings to structure your content');
  }

  const readabilityScore = calculateFleschReadingEase(plainText);
  if (readabilityScore < 60) {
    issues.push('Content readability is difficult (Flesch score < 60)');
    score -= 5;
    recommendations.push('Simplify sentences and use shorter words for better readability');
  }

  const hasInternalLinks = content && content.includes('<a href');
  if (!hasInternalLinks) {
    recommendations.push('Add internal links to related content');
    score -= 5;
  }

  const hasImages = content && content.includes('<img');
  if (!hasImages) {
    recommendations.push('Add images to make content more engaging');
    score -= 5;
  }

  if (score > 90) {
    recommendations.push('Excellent! Your content is well-optimized');
  } else if (score > 70) {
    recommendations.push('Good SEO score, address the issues above for better optimization');
  } else {
    recommendations.push('Needs improvement. Focus on the critical issues listed above');
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

export function generateMetaTitle(title, siteName = '') {
  const maxLength = 60;
  let metaTitle = title;

  if (siteName && metaTitle.length + siteName.length + 3 < maxLength) {
    metaTitle = `${title} | ${siteName}`;
  }

  if (metaTitle.length > maxLength) {
    metaTitle = metaTitle.substring(0, maxLength - 3) + '...';
  }

  return metaTitle;
}

export function generateMetaDescription(content, maxLength = 160) {
  const plainText = extractPlainText(content);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

export function generateSchemaMarkup(post) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    articleBody: extractPlainText(post.content),
    author: {
      '@type': 'Person',
      name: post.author
    },
    datePublished: post.publish_date,
    dateModified: post.updated_at,
    image: post.featured_image_url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url
    }
  };
  
  if (post.targetLocation) {
    schema.contentLocation = {
      '@type': 'Place',
      name: post.targetLocation
    };
  }
  
  return schema;
}

export function generateOpenGraphTags(post) {
  return {
    'og:type': 'article',
    'og:title': post.title,
    'og:description': post.meta_description,
    'og:url': post.url,
    'og:site_name': post.siteName,
    ...(post.featured_image_url && { 'og:image': post.featured_image_url })
  };
}

export function generateTwitterCardTags(post) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': post.title,
    'twitter:description': post.meta_description,
    ...(post.featured_image_url && { 'twitter:image': post.featured_image_url }),
    ...(post.twitterHandle && { 'twitter:site': post.twitterHandle })
  };
}
