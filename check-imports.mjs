
async function check() {
  try {
    const fm = await import("framer-motion");
    console.log("framer-motion exports:", Object.keys(fm).filter(k => k.startsWith("use")));
  } catch (e) {
    console.log("framer-motion error:", e.message);
  }

  try {
    const mr = await import("motion/react");
    console.log("motion/react exports:", Object.keys(mr).filter(k => k.startsWith("use")));
  } catch (e) {
    console.log("motion/react error:", e.message);
  }

  try {
    const m = await import("motion");
    console.log("motion exports:", Object.keys(m).filter(k => k.startsWith("use")));
  } catch (e) {
    console.log("motion error:", e.message);
  }
}

check();
