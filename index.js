const puppeteer = require('puppeteer');
const cron = require('node-cron');
const args = process.argv.slice(2);

const goSerfing = async (url) => {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 250,
  });
  const page = await browser.newPage();
  await page.goto(url);
  const vkLog = await page.$$('#ulogin a');
  const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
  await vkLog[0].click();
  const vkPage = await newPagePromise;
  await vkPage.type('input[name="email"]', args[1]);
  await vkPage.type('input[name="pass"]', args[2]);
  const navigationPromise = page.waitForNavigation();
  await vkPage.click('#install_allow');
  await navigationPromise;
  await page.$$('#boxUserFirstInfo');
  await page.keyboard.press('Escape');
  const tasks = await page.$$('div.join-group a.site-link');
  if(tasks.length != 0) {
    for (let i = 0; i < tasks.length; i++) {
        let newPagePromiseVk = new Promise(x => browser.once('targetcreated', target => x(target.page())));
        await tasks[i].click();
        let newPageVk = await newPagePromiseVk;
        const url = await newPageVk.url();
        console.log('url: ', url);
        console.log('url.indexOf(wall) !== -1: ', url.indexOf('wall') !== -1);
        if(url.indexOf('wall') === -1) {
          const exists = !!(await newPageVk.$('#public_subscribe'));
          const exists1 = !!(await newPageVk.$('#join_button'));
          const exists2 = !!(await newPageVk.$('#friend_status'));
          console.log('exists: ', exists);
          console.log('exists1: ', exists1);
          console.log('exists2: ', exists2);
          if(exists) {
            console.log('exists');
            await newPageVk.click('#public_subscribe');
            await newPageVk.waitFor(6000);
          }
          if(exists1) {
            console.log('exists1');
            await newPageVk.click('#join_button');
            await newPageVk.waitFor(6000);
          }
          if(exists2) {
            console.log('exists2');
            await newPageVk.click('#friend_status');
            await newPageVk.waitFor(6000);
          }
          if(url.indexOf('photo') !== -1) {
            await newPageVk.click('[title="Нравится"]');
          }
          await newPageVk.close();
          await page.waitFor(4000);
          const verifys = await page.$$('div.join-group a.verify');
          await verifys[i].click();
          await page.waitFor(4000);
        }
      }
  }
  await page.waitForSelector('#content_money');
  await getBalans(page);
  await browser.close();
};
  
  const getBalans = async (page) => {
    const balans = await page.evaluate(el => el.innerText, await page.$('#content_money'));
    await page.waitFor(7000);
    console.log(balans);
  }

  goSerfing(args[0]);
  // cron.schedule('*/30 * * * *', () => goSerfing(args[0]));