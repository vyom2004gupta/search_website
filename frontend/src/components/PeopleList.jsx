import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function PeopleList({ people, loading, error }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!people.length) {
    return (
      <Alert severity="info">
        No people found. Try a different search term.
      </Alert>
    );
  }

  return (
    <Grid container spacing={2}>
      {people.map((person) => (
        <Grid item xs={12} sm={6} key={person.id}>
          <Card
            sx={{
              display: 'flex',
              height: '100%',
              backgroundColor: 'background.paper',
            }}
          >
            <CardMedia
              component="img"
              sx={{ width: 140 }}
              image={person.photo}
              alt={person.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/140x200?text=No+Image';
              }}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                {person.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2" color="text.secondary">
                  {person.phone || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2" color="text.secondary">
                  {person.email || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2" color="text.secondary">
                  {person.lat && person.lon
                    ? `${person.lat.toFixed(2)}, ${person.lon.toFixed(2)}`
                    : 'Location not available'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default PeopleList; 