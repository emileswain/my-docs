//! Document parsing into a generic [`DocNode`] tree.
//!
//! This is the Rust port target for the Python `FileParser`. Markdown and JSON
//! are implemented as the working end-to-end slice; YAML / XML / mermaid /
//! junit are stubbed with TODOs so the command surface is complete and the
//! remaining ports are obvious.

use crate::engine::types::DocNode;

/// Parse a file's raw `content` into a tree, dispatching on `extension`
/// (lowercased, with leading dot, e.g. ".md").
pub fn parse(extension: &str, content: &str) -> Vec<DocNode> {
    match extension {
        ".md" => parse_markdown(content),
        ".json" => parse_json(content),
        // TODO(port): the remaining formats from Python file_parser.py
        ".yml" | ".yaml" => parse_yaml(content),
        ".xml" => parse_xml(content),
        ".mmd" => parse_mermaid(content),
        _ => vec![DocNode {
            kind: "raw".into(),
            label: "content".into(),
            value: Some(content.to_string()),
            children: vec![],
        }],
    }
}

/// Render markdown to an HTML string (for the markdown viewer). Mirrors the
/// Python `markdown.Markdown(extensions=['fenced_code', 'tables'])` output
/// closely enough for rendering; tables + fenced code are enabled.
pub fn markdown_to_html(content: &str) -> String {
    use pulldown_cmark::{html, Options, Parser};
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);
    let parser = Parser::new_ext(content, options);
    let mut out = String::new();
    html::push_html(&mut out, parser);
    out
}

/// Markdown -> a heading outline tree, using pulldown-cmark's event stream.
fn parse_markdown(content: &str) -> Vec<DocNode> {
    use pulldown_cmark::{Event, HeadingLevel, Parser, Tag, TagEnd};

    let parser = Parser::new(content);
    // Flat list of (level, text); we nest afterwards.
    let mut headings: Vec<(u8, String)> = Vec::new();
    let mut current_level: Option<HeadingLevel> = None;
    let mut buf = String::new();

    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                current_level = Some(level);
                buf.clear();
            }
            Event::Text(t) | Event::Code(t) if current_level.is_some() => buf.push_str(&t),
            Event::End(TagEnd::Heading(level)) => {
                headings.push((level as u8, std::mem::take(&mut buf)));
                current_level = None;
            }
            _ => {}
        }
    }

    nest_headings(&headings)
}

/// Turn a flat (level, text) list into a nested DocNode tree.
fn nest_headings(headings: &[(u8, String)]) -> Vec<DocNode> {
    fn build(items: &[(u8, String)], idx: &mut usize, min_level: u8) -> Vec<DocNode> {
        let mut nodes = Vec::new();
        while *idx < items.len() {
            let (level, text) = &items[*idx];
            if *level < min_level {
                break;
            }
            *idx += 1;
            let children = build(items, idx, level + 1);
            nodes.push(DocNode {
                kind: "heading".into(),
                label: text.clone(),
                value: None,
                children,
            });
        }
        nodes
    }
    let mut idx = 0;
    build(headings, &mut idx, 1)
}

/// JSON -> a key/value tree.
fn parse_json(content: &str) -> Vec<DocNode> {
    match serde_json::from_str::<serde_json::Value>(content) {
        Ok(value) => vec![json_to_node("root", &value)],
        Err(e) => vec![DocNode {
            kind: "error".into(),
            label: format!("Invalid JSON: {e}"),
            value: None,
            children: vec![],
        }],
    }
}

fn json_to_node(key: &str, value: &serde_json::Value) -> DocNode {
    use serde_json::Value;
    match value {
        Value::Object(map) => DocNode {
            kind: "object".into(),
            label: key.into(),
            value: None,
            children: map.iter().map(|(k, v)| json_to_node(k, v)).collect(),
        },
        Value::Array(arr) => DocNode {
            kind: "array".into(),
            label: key.into(),
            value: None,
            children: arr
                .iter()
                .enumerate()
                .map(|(i, v)| json_to_node(&format!("[{i}]"), v))
                .collect(),
        },
        other => DocNode {
            kind: "value".into(),
            label: key.into(),
            value: Some(other.to_string()),
            children: vec![],
        },
    }
}

// --- stubs to port from Python ---

fn parse_yaml(content: &str) -> Vec<DocNode> {
    // serde_yaml deserializes into the same Value model json uses; reuse it.
    match serde_yaml::from_str::<serde_json::Value>(content) {
        Ok(value) => vec![json_to_node("root", &value)],
        Err(e) => vec![DocNode {
            kind: "error".into(),
            label: format!("Invalid YAML: {e}"),
            value: None,
            children: vec![],
        }],
    }
}

fn parse_xml(_content: &str) -> Vec<DocNode> {
    // TODO(port): port _build_xml_tree / parse_junit_xml from file_parser.py
    vec![DocNode {
        kind: "todo".into(),
        label: "XML parsing not yet ported".into(),
        value: None,
        children: vec![],
    }]
}

fn parse_mermaid(content: &str) -> Vec<DocNode> {
    // TODO(port): mermaid is rendered client-side; likely just pass raw through.
    vec![DocNode {
        kind: "mermaid".into(),
        label: "diagram".into(),
        value: Some(content.to_string()),
        children: vec![],
    }]
}
