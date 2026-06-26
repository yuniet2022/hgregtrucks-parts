import { useParams, useNavigate } from 'react-router';
import { useParts } from '../hooks/useParts';
import { useCart } from '../hooks/useCart';
import { useVariants } from '../hooks/useVariants';
import HGregLogo from '../components/HGregLogo';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Check,
  Truck,
  Shield,
  Wrench,
  Star,
  Minus,
  Plus,
  Store,
  PackageCheck,
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parts } = useParts();
  const { addItem, items: cartItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [returnCore, setReturnCore] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const { variants: productVariants } = useVariants(product?.id);
  const hasVariants = productVariants.length > 0;
  const activeVariant = hasVariants && selectedVariant !== null
    ? productVariants.find(v => v.id === selectedVariant)
    : null;
  const displayPrice = activeVariant ? activeVariant.price : product?.price;
  const displayStock = activeVariant ? activeVariant.stock : (product?.stock || 0);
  const displaySku = activeVariant ? activeVariant.sku : product?.sku;

  const product = parts.find((p) => p.id === Number(id));

  // Build gallery from real images (filter out empty/null/undefined ones)
  const gallery = product
    ? [product.image, product.image2, product.image3, product.image4].filter((img): img is string => !!img && img.trim() !== '')
    : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (product && gallery.length > 0) {
      setMainImage(gallery[0]);
      setActiveImageIndex(0);
    }
  }, [product?.id]);

  const handlePrevImage = () => {
    if (gallery.length <= 1) return;
    const newIndex = activeImageIndex > 0 ? activeImageIndex - 1 : gallery.length - 1;
    setActiveImageIndex(newIndex);
    setMainImage(gallery[newIndex]);
  };

  const handleNextImage = () => {
    if (gallery.length <= 1) return;
    const newIndex = activeImageIndex < gallery.length - 1 ? activeImageIndex + 1 : 0;
    setActiveImageIndex(newIndex);
    setMainImage(gallery[newIndex]);
  };

  if (!product) {
    return (
      <div className="min-h-[100dvh] bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <p className="text-chrome text-xl mb-4">Product not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-amber hover:underline"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const inCart = cartItems.find((i) => i.id === product.id);
  const cartQty = inCart?.quantity || 0;
  const maxQty = displayStock - cartQty;

  const handleAddToCart = () => {
    if (quantity > maxQty) return;
    const basePrice = parseFloat(displayPrice || product.price);
    const hasCore = parseFloat(product.coreCharge || '0') > 0;
    const hasRebate = parseFloat(product.coreRebate || '0') > 0;
    const finalPrice = hasCore && !returnCore
      ? basePrice + parseFloat(product.coreCharge || '0')
      : hasRebate && returnCore
      ? basePrice - parseFloat(product.coreRebate || '0')
      : basePrice;
    const itemName = activeVariant
      ? `${product.name} — ${activeVariant.variantName}`
      : product.name;
    addItem({
      id: product.id,
      name: itemName,
      sku: displaySku || product.sku,
      price: finalPrice,
      image: product.image,
      stock: displayStock,
      returnCore,
      coreRebate: product.coreRebate,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedParts = parts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.make === product.make)
    )
    .slice(0, 4);

  return (
    <div className="min-h-[100dvh] bg-obsidian">
      {/* Top nav */}
      <nav className="w-full h-16 bg-ink/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-steel hover:text-chrome transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <a href="/#/">
            <HGregLogo />
          </a>
        </div>
        <button
          onClick={() => navigate('/cart')}
          className="relative p-2 text-steel hover:text-chrome transition-colors"
        >
          <ShoppingCart size={20} />
          {cartQty > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber text-obsidian text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartQty}
            </span>
          )}
        </button>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images Gallery */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-ink border border-white/[0.06] group">
              <img
                src={mainImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain bg-[#0a0a0c]"
              />
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-chrome opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
                    aria-label="Previous image"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-chrome opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/80"
                    aria-label="Next image"
                  >
                    <ArrowRight size={18} />
                  </button>
                  {/* Image counter */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-chrome border border-white/10">
                    {activeImageIndex + 1} / {gallery.length}
                  </div>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setMainImage(img); setActiveImageIndex(i); }}
                    className={`aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      activeImageIndex === i ? 'border-amber ring-1 ring-amber/30' : 'border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs tracking-[0.1em] uppercase text-amber bg-amber/10 px-3 py-1 rounded">
                {product.category}
              </span>
              <span className="text-xs text-steel">SKU: {displaySku}</span>
            </div>

            {/* Variant Selector */}
            {hasVariants && (
              <div className="mb-4">
                <label className="block text-xs text-steel uppercase tracking-wider mb-2">
                  Select {(product as any).variantLabel || 'Size'}
                </label>
                <select
                  value={selectedVariant ?? ''}
                  onChange={(e) => setSelectedVariant(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-ink border border-white/[0.12] rounded-lg px-4 py-3 text-sm text-chrome appearance-none cursor-pointer focus:border-amber focus:outline-none"
                >
                  <option value="">Choose {(product as any).variantLabel || 'Size'}...</option>
                  {productVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.variantName} — ${v.price} ({v.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-light text-chrome leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className="text-amber fill-amber" />
                ))}
              </div>
              <span className="text-sm text-steel">(47 reviews)</span>
            </div>

            {/* Price with Core Charge */}
            {(() => {
              const hasCore = parseFloat(product.coreCharge || '0') > 0;
              const hasRebate = parseFloat(product.coreRebate || '0') > 0;
              const basePrice = parseFloat(displayPrice || product.price);
              const finalPrice = hasCore && !returnCore
                ? basePrice + parseFloat(product.coreCharge || '0')
                : hasRebate && returnCore
                ? basePrice - parseFloat(product.coreRebate || '0')
                : basePrice;
              const savings = hasRebate && returnCore ? parseFloat(product.coreRebate || '0') : 0;

              return (
                <div className="mb-6">
                  <p className="text-4xl font-light text-amber tracking-tight">
                    ${finalPrice.toFixed(2)}
                  </p>
                  {hasCore && (
                    <div className="mt-3">
                      <div className="bg-ink rounded-xl border border-white/[0.08] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-chrome">Core Charge</p>
                            <p className="text-xs text-steel">Return your old part for a discount</p>
                          </div>
                          <div className="text-right">
                            {returnCore ? (
                              <p className="text-sm text-teal font-medium">-${product.coreRebate} rebate</p>
                            ) : (
                              <p className="text-sm text-warning font-medium">+${product.coreCharge} charge</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setReturnCore(!returnCore)}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            returnCore
                              ? 'bg-teal/20 text-teal border border-teal/30'
                              : 'bg-white/[0.05] text-steel border border-white/[0.12] hover:border-white/20'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            returnCore ? 'bg-teal border-teal' : 'border-steel'
                          }`}>
                            {returnCore && <Check size={12} className="text-obsidian" />}
                          </span>
                          {returnCore ? 'I will return my old core (-$' + product.coreRebate + ')' : 'I will return my old core (save $' + (product.coreRebate || product.coreCharge) + ')'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Fulfillment Options - Pickup / Deliver / Ship */}
            {(product.pickup || product.deliver || product.ship) && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {product.pickup === 1 && (
                  <div className="bg-ink rounded-xl border border-white/[0.06] p-4 text-center">
                    <Store size={22} className="text-amber mx-auto mb-2" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-chrome mb-1">Pickup</p>
                    <p className="text-xs text-teal font-medium">
                      {displayStock > 0 ? 'In Stock' : 'Unavailable'}
                    </p>
                    <p className="text-[11px] text-steel mt-1">
                      {displayStock > 0 ? 'Ready in 1hr' : 'Out of stock'}
                    </p>
                  </div>
                )}
                {product.deliver === 1 && (
                  <div className="bg-ink rounded-xl border border-white/[0.06] p-4 text-center">
                    <Truck size={22} className="text-amber mx-auto mb-2" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-chrome mb-1">Deliver</p>
                    <p className="text-xs text-teal font-medium">Available</p>
                    <p className="text-[11px] text-steel mt-1">Dade & Broward</p>
                  </div>
                )}
                {product.ship === 1 && (
                  <div className="bg-ink rounded-xl border border-white/[0.06] p-4 text-center">
                    <PackageCheck size={22} className="text-amber mx-auto mb-2" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-chrome mb-1">Ship</p>
                    <p className="text-xs text-teal font-medium">LTL Available</p>
                    <p className="text-[11px] text-steel mt-1">Nationwide</p>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-steel leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Specs */}
            <div className="bg-ink rounded-xl border border-white/[0.06] p-5 mb-6">
              <h3 className="text-xs tracking-[0.1em] uppercase text-steel mb-4">
                SPECIFICATIONS
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-steel">OEM #:</span>
                  <span className="text-chrome ml-2 font-mono">{product.oemNumber}</span>
                </div>
                <div>
                  <span className="text-steel">Brand:</span>
                  <span className="text-chrome ml-2">{product.brand}</span>
                </div>
                <div>
                  <span className="text-steel">Make:</span>
                  <span className="text-chrome ml-2">{product.make} {product.model}</span>
                </div>
                <div>
                  <span className="text-steel">Years:</span>
                  <span className="text-chrome ml-2">{product.yearFrom}-{product.yearTo}</span>
                </div>
                <div>
                  <span className="text-steel">Stock:</span>
                  <span className={`ml-2 ${displayStock > 10 ? 'text-teal' : displayStock > 5 ? 'text-amber' : 'text-warning'}`}>
                    {displayStock} available
                  </span>
                </div>
                <div>
                  <span className="text-steel">Category:</span>
                  <span className="text-chrome ml-2">{product.category}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex items-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2 text-steel">
                <Truck size={16} className="text-teal" />
                Same-day pickup
              </div>
              <div className="flex items-center gap-2 text-steel">
                <Shield size={16} className="text-teal" />
                1 Year Warranty
              </div>
              <div className="flex items-center gap-2 text-steel">
                <Wrench size={16} className="text-teal" />
                OEM Quality
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-ink border border-white/[0.12] rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-steel hover:text-chrome transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-3 text-chrome font-medium min-w-[48px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="px-4 py-3 text-steel hover:text-chrome transition-colors disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={maxQty <= 0 || added}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold tracking-[0.04em] uppercase transition-all duration-300 ${
                  added
                    ? 'bg-teal text-obsidian'
                    : maxQty <= 0
                    ? 'bg-white/[0.08] text-steel/50 cursor-not-allowed'
                    : 'bg-amber text-obsidian hover:bg-chrome'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} /> ADDED
                  </>
                ) : maxQty <= 0 ? (
                  'OUT OF STOCK'
                ) : (
                  <>
                    <ShoppingCart size={18} /> ADD TO CART
                  </>
                )}
              </button>
            </div>

            {cartQty > 0 && (
              <p className="text-xs text-teal mt-3">
                {cartQty} in your cart — <button onClick={() => navigate('/cart')} className="underline hover:text-chrome">View cart</button>
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedParts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-light text-chrome mb-8 tracking-tight">
              Related Parts
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedParts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-ink rounded-xl border border-white/[0.06] overflow-hidden text-left hover:border-amber/30 transition-all duration-300 group"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-steel mb-1">{p.category}</p>
                    <p className="text-sm font-medium text-chrome leading-snug line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-lg font-medium text-amber mt-2">
                      ${p.price}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
