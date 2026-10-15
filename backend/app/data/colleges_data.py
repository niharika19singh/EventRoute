"""Colleges dataset with verified geographic coordinates and details."""

from typing import List, Dict, Any

COLLEGES_DATA: List[Dict[str, Any]] = [
    {
        "id": "iiitd",
        "name": "Indraprastha Institute of Information Technology Delhi",
        "short_name": "IIIT Delhi",
        "city": "New Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.5459, "lng": 77.2732},
        "address": "Okhla Industrial Estate, Phase III, Near Govind Puri Metro Station, New Delhi 110020",
        "website": "https://www.iiitd.ac.in",
        "campus_type": "Information Technology / Research"
    },
    {
        "id": "iitd",
        "name": "Indian Institute of Technology Delhi",
        "short_name": "IIT Delhi",
        "city": "New Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.5450, "lng": 77.1926},
        "address": "Hauz Khas, New Delhi 110016",
        "website": "https://home.iitd.ac.in",
        "campus_type": "Institute of National Importance"
    },
    {
        "id": "dtu",
        "name": "Delhi Technological University",
        "short_name": "DTU",
        "city": "Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.7499, "lng": 77.1170},
        "address": "Shahbad Daulatpur, Main Bawana Road, Delhi 110042",
        "website": "https://www.dtu.ac.in",
        "campus_type": "State Technological University"
    },
    {
        "id": "nsut",
        "name": "Netaji Subhas University of Technology",
        "short_name": "NSUT",
        "city": "New Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.6083, "lng": 77.0354},
        "address": "Sector 3, Dwarka, New Delhi 110078",
        "website": "https://www.nsut.ac.in",
        "campus_type": "State Technological University"
    },
    {
        "id": "du_north",
        "name": "University of Delhi - North Campus",
        "short_name": "DU North Campus",
        "city": "Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.6890, "lng": 77.2085},
        "address": "Vishwavidyalaya Marg, University Enclave, Delhi 110007",
        "website": "https://www.du.ac.in",
        "campus_type": "Central University"
    },
    {
        "id": "du_south",
        "name": "University of Delhi - South Campus",
        "short_name": "DU South Campus",
        "city": "New Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.5861, "lng": 77.1645},
        "address": "Benito Juarez Road, Dhaula Kuan, New Delhi 110021",
        "website": "https://www.du.ac.in",
        "campus_type": "Central University"
    },
    {
        "id": "jmi",
        "name": "Jamia Millia Islamia",
        "short_name": "Jamia",
        "city": "New Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.5615, "lng": 77.2801},
        "address": "Jamia Nagar, Okhla, New Delhi 110025",
        "website": "https://www.jmi.ac.in",
        "campus_type": "Central University"
    },
    {
        "id": "jnu",
        "name": "Jawaharlal Nehru University",
        "short_name": "JNU",
        "city": "New Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.5383, "lng": 77.1666},
        "address": "New Mehrauli Road, JNU Ring Rd, New Delhi 110067",
        "website": "https://www.jnu.ac.in",
        "campus_type": "Central University"
    },
    {
        "id": "igdtuw",
        "name": "Indira Gandhi Delhi Technical University for Women",
        "short_name": "IGDTUW",
        "city": "Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.6652, "lng": 77.2324},
        "address": "James Church, New Church Rd, Kashmere Gate, Delhi 110006",
        "website": "https://www.igdtuw.ac.in",
        "campus_type": "Women's Technical University"
    },
    {
        "id": "mait",
        "name": "Maharaja Agrasen Institute of Technology",
        "short_name": "MAIT",
        "city": "Delhi",
        "state": "Delhi",
        "coordinates": {"lat": 28.7196, "lng": 77.0661},
        "address": "PSP Area, Plot No. 1, Sector 22, Rohini, Delhi 110086",
        "website": "https://www.mait.ac.in",
        "campus_type": "Affiliated Engineering Institute"
    },
    {
        "id": "jiit",
        "name": "Jaypee Institute of Information Technology",
        "short_name": "JIIT Noida",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "coordinates": {"lat": 28.6305, "lng": 77.3721},
        "address": "A-10, Sector 62, Noida, Uttar Pradesh 201309",
        "website": "https://www.jiit.ac.in",
        "campus_type": "Deemed University"
    },
    {
        "id": "bits_pilani",
        "name": "Birla Institute of Technology and Science, Pilani",
        "short_name": "BITS Pilani",
        "city": "Pilani",
        "state": "Rajasthan",
        "coordinates": {"lat": 28.3639, "lng": 75.5873},
        "address": "Vidya Vihar, Pilani, Rajasthan 333031",
        "website": "https://www.bits-pilani.ac.in",
        "campus_type": "Deemed University"
    }
]


def get_all_colleges() -> List[Dict[str, Any]]:
    return COLLEGES_DATA


def get_college_by_id(college_id: str) -> Dict[str, Any] | None:
    for c in COLLEGES_DATA:
        if c["id"].lower() == college_id.lower():
            return c
    return None


def find_closest_college(name_or_keyword: str) -> Dict[str, Any] | None:
    """Fuzzy match college name to college database."""
    if not name_or_keyword or len(name_or_keyword.strip()) < 2:
        return None
    k = name_or_keyword.lower().strip()
    for c in COLLEGES_DATA:
        if k in c["name"].lower() or k in c["short_name"].lower() or (len(c["id"]) >= 3 and c["id"] in k):
            return c
    return None

