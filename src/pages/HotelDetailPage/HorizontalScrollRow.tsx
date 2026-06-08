import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './HotelDetailPage.module.css'

interface HorizontalScrollRowProps {
  children: ReactNode
  scrollStep?: number
  ariaLabelLeft: string
  ariaLabelRight: string
  trackClassName?: string
}

export function HorizontalScrollRow({
  children,
  scrollStep = 220,
  ariaLabelLeft,
  ariaLabelRight,
  trackClassName,
}: HorizontalScrollRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const { scrollLeft, scrollWidth, clientWidth } = scroller
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    scrollerRef.current?.scrollBy({
      left: direction === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    updateScrollState()

    const scroller = scrollerRef.current
    if (!scroller) return

    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(scroller)

    return () => resizeObserver.disconnect()
  }, [children, updateScrollState])

  return (
    <div className={styles.horizontalScrollerWrapper}>
      {canScrollLeft && <div className={styles.horizontalScrollerFadeLeft} aria-hidden="true" />}
      {canScrollRight && <div className={styles.horizontalScrollerFadeRight} aria-hidden="true" />}

      {canScrollLeft && (
        <button
          type="button"
          className={`${styles.scrollArrow} ${styles.scrollArrowLeft}`}
          onClick={() => scroll('left')}
          aria-label={ariaLabelLeft}
        >
          &#8249;
        </button>
      )}

      <div
        ref={scrollerRef}
        className={trackClassName ?? styles.horizontalScroller}
        onScroll={updateScrollState}
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          type="button"
          className={`${styles.scrollArrow} ${styles.scrollArrowRight}`}
          onClick={() => scroll('right')}
          aria-label={ariaLabelRight}
        >
          &#8250;
        </button>
      )}
    </div>
  )
}
