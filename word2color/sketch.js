const words = document.getElementById('words');
RNG = xorshift128;
  
let timer_id = 0;
document.body.addEventListener('keyup', ev => {
  clearTimeout(timer_id);
  timer_id = setTimeout(() => {
    const seed = words.value;
    xorshift128_seed(seed);
    let sum = [];
    for (let i = 0; i < 230; i++) sum.push(RNG()); 
    document.body.style.background = hsl(RNG() * 360, 50 + 50 * RNG(), 50 + 50 * RNG());
  }, 500);
});

