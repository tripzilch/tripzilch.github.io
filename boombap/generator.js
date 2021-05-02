// useful extensions to built-in objects
const $G = Object.getPrototypeOf(function* () {});

$G.of = function* (items) { yield* items.values(); }
$G.loop = function* (N, fn) {
  for (let i = 0; i < N; i++) yield fn(i);
}
$G.loop1 = function* (N, fn) {
  const N1 = 1 / N;
  for (let i = 0; i < N; i++) yield fn(i * N1);
}
$G.loop11 = function* (N, fn) {
  const N1 = 1 / (N - 1);
  for (let i = 0; i < N; i++) yield fn(i * N1);
}

$G.prototype.enumerate = function* (start=0) {
  let i = start;
  for (const v of this) {
    yield [v, i];
    i++;
  }
};

$G.prototype.map = function* (fn) {
  let i = 0;
  for (const v of this) {
    yield fn(v, i);
    i++;
  }
};

$G.prototype.filter = function* (fn) {
  let i = 0;
  for (const v of this) {
    if (fn(v, i)) yield v;
    i++;
  }
};

$G.prototype.some = function (fn) {
  let i = 0;
  for (const v of this) {
    if (fn(v, i)) return true;
    i++;
  }
  return false;
};

$G.prototype.count = function (fn) {
  let i = 0, total = 0;
  for (const v of this) {
    if (fn(v, i)) total++;
    i++;
  }
  return total;
};

$G.prototype.dropwhile = function* (fn) {
  const {value, done} = this.filter(fn).next();
  if (! done) { yield value; yield* this; }
};

$G.prototype.uniq = function* () {
  // so it skips initial undefined values, oh well
  let prev;
  for (let v of this) {
    if (v !== prev) yield v;
    prev = v;
  }
}

$G.prototype.head = function* (N) {
  for(let i = 0; i < N; i++) {
    const {value, done} = this.next();
    if (done) {
      return;
    } else {
      yield value;
    }
  }
};

$G.prototype.last = function () {
  let lv;
  for (const v of this) lv = v;
  return lv;
}

$G.prototype.skip = function* (N) {
  for (let i = 0; i < N; i++) this.next();
  yield* this;
}

$G.prototype.skip_every = function* (N) {
  let i = N;
  for (const v of this) {
    if (i == N) {
      yield v;
      i = 0;
    }
    i++;
  }
}

$G.prototype.append = function* (...generators) { yield* this; for (const g of generators) { yield* g; } };
$G.prototype.prepend = function* (...generators) { for (const g of generators) { yield* g; } yield* this; };
$G.chain = function* (...generators) { for (const g of generators) { yield* g; } };

$G.prototype.repeat = function* (N=Infinity) { for (let i = 0; i < N; i++) yield* this; };

$G.prototype.pair = function* (other) {
  for (const left_val of this) {
    const {value: right_val, done} = other.next();
    if (done) { 
      return; 
    } else { 
      yield [left_val, right_val];
    }
  }
}

$G.prototype.tail = function* (n) {
  const hist = Array(n);
  for (const v of this) {
    hist.push(v); hist.shift(); // inefficient?
    yield $G.of(...hist);
  }
}

