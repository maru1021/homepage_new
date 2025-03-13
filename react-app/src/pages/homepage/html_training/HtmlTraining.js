import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Container,
  Grid,
  useMediaQuery,
  useTheme,
  styled
} from '@mui/material';

const EditorHeaderBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#343a40',
  color: 'white',
  padding: theme.spacing(1, 1.5),
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
  fontWeight: 'bold'
}));

const EditorTextarea = styled('textarea')(({ theme }) => ({
  width: '100%',
  fontFamily: 'monospace',
  fontSize: '14px',
  padding: theme.spacing(1.5),
  border: '1px solid #dee2e6',
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
  resize: 'none',
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 0.2rem ${theme.palette.primary.light}40`
  }
}));

const PreviewFrame = styled('iframe')(({ theme }) => ({
  width: '100%',
  backgroundColor: 'white',
  border: '1px solid #dee2e6',
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius
}));

const EditorHeader = ({ title }) => (
  <EditorHeaderBox>
    {title}
  </EditorHeaderBox>
);

EditorHeader.propTypes = {
  title: PropTypes.string.isRequired
};

const HtmlTraining = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [htmlCode, setHtmlCode] = useState('<h1>Hello World</h1>');
  const [cssCode, setCssCode] = useState('');
  const [combinedCode, setCombinedCode] = useState('Hello World');

  useEffect(() => {
    const sanitizedHtml = sanitizeHtml(htmlCode);

    const combined = `
      <html>
        <head>
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self'; img-src 'self' data:;">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>${cssCode}</style>
        </head>
        <body class="p-3">
          ${sanitizedHtml}
        </body>
      </html>
    `;
    setCombinedCode(combined);
  }, [htmlCode, cssCode]);

  // HTMLをサニタイズする関数
  const sanitizeHtml = (html) => {
    // <script>タグとonイベントハンドラを削除
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // JavaScriptのURL（javascript:alert()など）を削除
    sanitized = sanitized.replace(/javascript:/gi, 'blocked:');

    // インラインのJavaScriptイベントハンドラを削除
    const eventHandlers = [
      'onclick', 'onload', 'onunload', 'onchange', 'onsubmit', 'onreset', 'onerror',
      'onselect', 'onblur', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup',
      'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onmousemove',
      'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart',
      'ondrop', 'oninput', 'oninvalid', 'onanimation'
    ];

    eventHandlers.forEach(handler => {
      const regex = new RegExp(`\\s${handler}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        HTML/CSSトレーニング
      </Typography>

      <Grid container spacing={3}>
        {/* エディター部分 */}
        <Grid item xs={12} md={6}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: isMobile ? 'auto' : '92vh',
            gap: 3
          }}>
            {/* HTML エディター */}
            <Box sx={{ flex: 1 }}>
              <EditorHeader title="HTML" />
              <EditorTextarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                spellCheck="false"
                sx={{
                  height: isMobile ? '40vh' : '45vh'
                }}
              />
            </Box>

            {/* CSS エディター */}
            <Box sx={{ flex: 1 }}>
              <EditorHeader title="CSS" />
              <EditorTextarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                spellCheck="false"
                sx={{
                  height: isMobile ? '40vh' : '45vh'
                }}
              />
            </Box>
          </Box>
        </Grid>

        {/* プレビュー部分 */}
        <Grid item xs={12} md={6}>
          <EditorHeader title="プレビュー" />
          <PreviewFrame
            srcDoc={combinedCode}
            sandbox="allow-same-origin allow-popups allow-forms"
            sx={{
              height: isMobile ? '60vh' : '92vh'
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default HtmlTraining;