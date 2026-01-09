import React, { useState, useEffect, useCallback } from "react";
import {
  makeStyles,
  withStyles,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Container,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { common } from "@material-ui/core/colors";
import Clear from "@material-ui/icons/Clear";
import { DropzoneArea } from "material-ui-dropzone";
import axios from "axios";

//import cblogo from "./cblogo.PNG";
import bgImage from "./background.jpg";

// Styled button
const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(common.white),
    backgroundColor: common.white,
    "&:hover": {
      backgroundColor: "#ffffff7a",
    },
  },
}))(Button);

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  clearButton: {
    width: "100%",
    borderRadius: "15px",
    padding: "15px 22px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
  },
  media: { height: 400 },
  gridContainer: {
    fontFamily:'Arial',
    justifyContent: "center",
    padding: "4em 1em 0 1em",
  },
  mainContainer: {
    backgroundImage: `url(${bgImage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    height: "110vh",
    marginTop: "8px",
  },
  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 500,
    backgroundColor: "transparent",
    boxShadow: "0px 9px 70px 0px rgb(0 0 0 / 30%) !important",
    borderRadius: "15px",
  },
  imageCardEmpty: { height: "auto" },
  detail: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  appbar: {
    background: "#be6a77",
    boxShadow: "none",
    color: "white",
  },
  loader: { color: "#be6a77 !important" },
  tableContainer: {
    backgroundColor: "transparent !important",
    boxShadow: "none !important",
  },
  tableCell: {
    fontSize: "22px",
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
    color: "#000000a6 !important",
    fontWeight: "bolder",
    padding: "1px 24px 1px 16px",
  },
  tableCell1: {
    fontSize: "14px",
    backgroundColor: "transparent !important",
    borderColor: "transparent !important",
    color: "#000000a6 !important",
    fontWeight: "bolder",
    padding: "1px 24px 1px 16px",
  },
}));

const DISEASE_INFO = {
  "Early Blight": {
    symptoms: "Dark brown spots with concentric rings on older leaves.",
    causes: "Fungal infection caused by Alternaria solani.",
    prevention: "Crop rotation, disease-free seeds, proper spacing.",
    treatment: "Use fungicides like Mancozeb or Chlorothalonil."
  },
  "Late Blight": {
    symptoms: "Water-soaked lesions, white mold under leaves.",
    causes: "Phytophthora infestans pathogen.",
    prevention: "Avoid overhead irrigation, remove infected plants.",
    treatment: "Apply metalaxyl-based fungicides."
  },
  "Healthy": {
    symptoms: "Green, firm leaves with no spots.",
    causes: "No disease detected.",
    prevention: "Maintain proper nutrition and watering.",
    treatment: "No treatment required."
  }
};

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isImage, setIsImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ UseCallback prevents useEffect dependency warning
  const sendFile = useCallback(async () => {
    if (!isImage || !selectedFile) return;

    setIsLoading(true);
    let formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post("http://localhost:8080/predict", formData);
      console.log("API Response:", res.data);

      if (res.status === 200) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isImage, selectedFile]);

  // Preview handler
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // cleanup to release memory
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Automatically send file when preview is ready
  useEffect(() => {
    if (preview) sendFile();
  }, [preview, sendFile]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setIsImage(false);
      setData(null);
      return;
    }
    setSelectedFile(files[0]);
    setIsImage(true);
    setData(null);
  };

  const clearData = () => {
    setSelectedFile(null);
    setPreview(null);
    setData(null);
    setIsImage(false);
  };

  let confidence = data
    ? (parseFloat(data.confidence) * 100).toFixed(2)
    : 0;

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Potato Disease Classification
          </Typography>
          <div className={classes.grow} />
          
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={false}
        className={classes.mainContainer}
        disableGutters
      >
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <Card
              className={`${classes.imageCard} ${
                !isImage ? classes.imageCardEmpty : ""
              }`}
            >
              {isImage && (
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={preview}
                    component="img"
                    title="Potato Leaf"
                  />
                </CardActionArea>
              )}

              {!isImage && (
                <CardContent>
                  <DropzoneArea
                    acceptedFiles={["image/*"]}
                    dropzoneText={
                      "Drag and drop an image of a potato plant leaf to process"
                    }
                    onChange={onSelectFile}
                  />
                </CardContent>
              )}

              {data && (
                <CardContent className={classes.detail}>
                  <TableContainer
                    component={Paper}
                    className={classes.tableContainer}
                  >
                    <Table size="small" aria-label="prediction table">
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.tableCell1}>
                            Label:
                          </TableCell>
                          <TableCell
                            align="right"
                            className={classes.tableCell1}
                          >
                            Confidence:
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className={classes.tableCell}>
                            {data.class}
                          </TableCell>
                          <TableCell
                            align="right"
                            className={classes.tableCell}
                          >
                            {confidence}%
                          </TableCell>
                        </TableRow>
                        
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}

              {isLoading && (
                <CardContent className={classes.detail}>
                  <CircularProgress color="secondary" />
                  <Typography variant="h6" noWrap>
                    Processing...
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>

          {data && (
            <Grid item className={classes.buttonGrid}>
              <CardContent 
                  className={classes.detail} 
                  style={{ marginBottom: '1vh' ,fontFamily:'Arial',borderRadius:'3vh',
                    boxShadow:'10px'
                  }}
                >
                  <Typography variant="h5">Disease Information</Typography>

                  {Object.entries(DISEASE_INFO[data.class]).map(([key, value]) => (
                    <Typography key={key}>
                      <strong>{key.toUpperCase()}:</strong> {value}
                    </Typography>
                  ))}
                </CardContent>
              <ColorButton
                style={{backgroundColor:'DodgerBlue'}}
                variant="contained"
                className={classes.clearButton}
                color="primary"
                onClick={clearData}
                startIcon={<Clear fontSize="large" />}
              >
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};
