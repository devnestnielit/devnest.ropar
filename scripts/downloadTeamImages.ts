import fs from 'fs';
import path from 'path';

const teamMembers = [
  {
    slug: 'sarwan-singh',
    url: 'https://media.licdn.com/dms/image/v2/C5603AQEUs82FX5FAYA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1517748498743?e=1791417600&v=beta&t=g8rcs-YZSa1AGhlX7OV5mPfvlrMOkE8-mlmMI3YgmkE',
  },
  {
    slug: 'naman-singla',
    url: 'https://media.licdn.com/dms/image/v2/D5603AQFc7dGzvuPw8g/profile-displayphoto-crop_800_800/B56Z6wBic6G0AM-/0/1781069655922?e=1791417600&v=beta&t=kDqmT3WJF_g124mz6Hq0t_9eT9o4NsLYsJPO_qnFyBE',
  },
  {
    slug: 'sohit-narayan',
    url: 'https://media.licdn.com/dms/image/v2/D4D03AQGh1HFWcG6BRQ/profile-displayphoto-crop_800_800/B4DZ9ZslHwIIAM-/0/1783916287207?e=1791417600&v=beta&t=8eeXjId39uhUX96lNysFJB7rUMuT9Ed0H9fkR4u3_t0',
  },
  {
    slug: 'nikhil-gupta',
    url: 'https://media.licdn.com/dms/image/v2/D4D03AQG_dNbchx1CLw/profile-displayphoto-crop_800_800/B4DaDHn2ciKUAI-/0/1790055509257?e=1792022400&v=beta&t=nP3hZk_18sVLmLIXLMV-IP-8bNXol3k5hOvhFnCKZhc',
  },
  {
    slug: 'harsh-saini',
    url: 'https://media.licdn.com/dms/image/v2/D5603AQENm9RiJvnWgw/profile-displayphoto-crop_800_800/B56Z0_rntxJwAM-/0/1774889894647?e=1791417600&v=beta&t=KEES16wrUO1tG40HN3DRBv1PsrmXcCAXT2zFd3cmu-w',
  },
  {
    slug: 'arghadeep-das',
    url: 'https://media.licdn.com/dms/image/v2/D5603AQENm9RiJvnWgw/profile-displayphoto-crop_800_800/B56Z0_rntxJwAM-/0/1774889894647?e=1791417600&v=beta&t=KEES16wrUO1tG40HN3DRBv1PsrmXcCAXT2zFd3cmu-w',
  },
  {
    slug: 'prakhar-mishra',
    url: 'https://media.licdn.com/dms/image/v2/D5603AQFL7klClOFC5g/profile-displayphoto-scale_400_400/B56Z.yIzGRGgAg-/0/1785400079606?e=1791417600&v=beta&t=v6ViQJFuaHJKsb3TVHkghdHPByULVjCzTXA9Xf84pKs',
  },
  {
    slug: 'aditya-singh',
    url: 'https://media.licdn.com/dms/image/v2/D5603AQHy4rP5qL3_Eg/profile-displayphoto-crop_800_800/B56Z_seUBmGUAI-/0/1786378798153?e=1791417600&v=beta&t=xNBuq-f7ZcrunUE3WctMCPYkQWUnu5EBfZ9p6sMe-z0',
  },
  {
    slug: 'kartik-vats',
    url: 'https://media.licdn.com/dms/image/v2/D4D03AQHOBPBEpzI_TA/profile-displayphoto-crop_800_800/B4DZhm3HNJHsAI-/0/1754072382566?e=1791417600&v=beta&t=4K13OLmLiI7z3DnTdiSUiKTQp15X9_nRE3Lwvkt_7xk',
  },
];

async function main() {
  const targetDir = path.resolve(process.cwd(), 'public', 'team');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const m of teamMembers) {
    const dest = path.join(targetDir, `${m.slug}.jpg`);
    console.log(`Downloading ${m.slug}...`);
    try {
      const res = await fetch(m.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Saved ${dest} (${buffer.length} bytes)`);
    } catch (err: any) {
      console.error(`Failed to download ${m.slug}: ${err.message}`);
    }
  }
}

main();
