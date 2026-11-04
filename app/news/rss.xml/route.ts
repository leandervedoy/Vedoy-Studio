import { listNewsPosts } from "@/lib/repository";
export const dynamic="force-dynamic";
function escapeXml(value:string){
  return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
export async function GET(){
  const posts=(await listNewsPosts(true)).slice(0,50);
  const items=posts.map(post=>{
    const url="https://vedoystudio.no/news/"+encodeURIComponent(post.slug);
    return "<item><title>"+escapeXml(post.title)+"</title><link>"+escapeXml(url)+"</link><guid isPermaLink=\"true\">"+escapeXml(url)+"</guid><description>"+escapeXml(post.excerpt)+"</description><pubDate>"+new Date(post.publishedAt||post.createdAt).toUTCString()+"</pubDate></item>";
  }).join("");
  const xml="<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version=\"2.0\"><channel><title>Vedoy News</title><link>https://vedoystudio.no/news</link><description>Teknologi, kode, sikkerhet og utvikling fra Vedoy.</description><language>nb-NO</language>"+items+"</channel></rss>";
  return new Response(xml,{headers:{"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"public, s-maxage=300, stale-while-revalidate=900"}});
}
