module.exports = (req, res) => {
    if (req.file) {
        const file = dataUri(req).content
        return uploader.upload(file)
                .then(result => {
                    const image = result.url
                    return {image}
                })
                .catch(err => console.log("Error"));
    } else {
        return "\error"
    }
}