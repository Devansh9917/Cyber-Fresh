import { useEffect, useRef } from "react"
import { translate } from "./useLanguage"

const translatableAttributes = ["aria-label", "placeholder", "title", "alt"]
const untranslatedAliases = {
  languageEnglish: "English",
  languageHindi: "Hindi",
  languageTamil: "Tamil",
}

export default function TranslatedContent({ language, children }) {
  const containerRef = useRef(null)
  const languageRef = useRef(language)
  const originalText = useRef(new WeakMap())
  const originalAttributes = useRef(new WeakMap())
  languageRef.current = language

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const translateTextNode = (node) => {
      const current = node.nodeValue || ""
      const previous = originalText.current.get(node)
      if (node.parentElement?.closest("[translate='no']")) {
        if (Object.hasOwn(untranslatedAliases, current)) {
          node.nodeValue = untranslatedAliases[current]
        } else if (previous && current === previous.translated) {
          node.nodeValue = previous.original
        }
        originalText.current.delete(node)
        return
      }
      const original = previous && current === previous.translated ? previous.original : current
      const leading = original.match(/^\s*/)?.[0] || ""
      const trailing = original.match(/\s*$/)?.[0] || ""
      const content = original.slice(leading.length, original.length - trailing.length || undefined)
      const translated = `${leading}${translate(languageRef.current, content)}${trailing}`
      originalText.current.set(node, { original, translated })
      if (current !== translated) node.nodeValue = translated
    }

    const translateAttribute = (element, attribute) => {
      const current = element.getAttribute(attribute)
      if (!current) return
      let attributes = originalAttributes.current.get(element)
      if (!attributes) {
        attributes = new Map()
        originalAttributes.current.set(element, attributes)
      }
      const previous = attributes.get(attribute)
      const original = previous && current === previous.translated ? previous.original : current
      const translated = translate(languageRef.current, original)
      attributes.set(attribute, { original, translated })
      if (current !== translated) element.setAttribute(attribute, translated)
    }

    const applyTranslations = (root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let node
      while ((node = walker.nextNode())) {
        if (!node.nodeValue?.trim() || node.parentElement?.closest("script, style, textarea, [contenteditable='true']")) continue
        translateTextNode(node)
      }

      const elements = root instanceof Element ? [root, ...root.querySelectorAll("*")] : root.querySelectorAll("*")
      for (const element of elements) {
        for (const attribute of translatableAttributes) translateAttribute(element, attribute)
      }
    }

    applyTranslations(container)
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "childList") {
          for (const node of record.addedNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
              translateTextNode(node)
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              applyTranslations(node)
            }
          }
        } else if (record.type === "characterData" && record.target.nodeValue?.trim()) {
          translateTextNode(record.target)
        } else if (record.type === "attributes" && translatableAttributes.includes(record.attributeName)) {
          translateAttribute(record.target, record.attributeName)
        }
      }
    })
    observer.observe(container, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    })
    return () => observer.disconnect()
  }, [language])

  return <div ref={containerRef} className="contents">{children}</div>
}
