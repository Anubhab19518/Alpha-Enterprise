// Test sliding carousel logic for Bewakoof style multi-card hero
const banners = [
  { id: '1', title: 'Explore Mens Collection' },
  { id: '2', title: 'Trendy Womens Collection' },
  { id: '3', title: 'Trendy Children Collection' },
  { id: '4', title: 'Trendy T-Shirts' }
];

console.log("Total banners:", banners.length);
for (let i = 0; i < 8; i++) {
  const currentIdx = i % banners.length;
  console.log(`Step ${i}: activeIndex = ${currentIdx}, showing banner: "${banners[currentIdx].title}"`);
}
