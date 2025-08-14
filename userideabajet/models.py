from django.db import models

# Step 1: Demografik Data
class UserInfo(models.Model):
    JANTINA_CHOICES = [
        ("Lelaki", "Lelaki"),
        ("Perempuan", "Perempuan"),
    ]
    BANGSA_CHOICES = [
        ("Melayu", "Melayu"),
        ("India", "India"),
        ("Cina", "Cina"),
        ("Lain-lain", "Lain-lain"),
    ]
    UMUR_CHOICES = [
        ("18 - 25 tahun", "18 - 25 tahun"),
        ("26 - 39 tahun", "26 - 39 tahun"),
        ("40 - 59 tahun", "40 - 59 tahun"),
        ("60 dan ke atas", "60 dan ke atas"),
    ]
    JOB_CHOICES = [
        ("Ahli Majlis, MBI", "Ahli Majlis, MBI"),
        ("Kakitangan MBI", "Kakitangan MBI"),
        ("Kakitangan Kerajaan", "Kakitangan Kerajaan"),
        ("Kakitangan Swasta", "Kakitangan Swasta"),
        ("Bekerja Sendiri", "Bekerja Sendiri"),
        ("Tidak Bekerja", "Tidak Bekerja"),
        ("Pelajar", "Pelajar"),
        ("Pesara", "Pesara"),
    ]
    ZON_CHOICES = [(f"Zon {i}", f"Zon {i}") for i in range(1, 25)]

    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    jantina = models.CharField(max_length=20, choices=JANTINA_CHOICES)
    bangsa = models.CharField(max_length=20, choices=BANGSA_CHOICES)
    umur = models.CharField(max_length=30, choices=UMUR_CHOICES)
    job = models.CharField(max_length=50, choices=JOB_CHOICES)
    zon = models.CharField(max_length=20, choices=ZON_CHOICES, blank=True, null=True)

    def __str__(self):
        return self.name


# Step 2: Pilih Keutamaan
class ElemenUtama(models.Model):
    ELEMENT_CHOICES = [
        (1, "IPOH BANDAR TERBERSIH"),
        (2, "KEMUDAHAN AWAM DAN TAMAN"),
        (3, "KEMUDAHAN INFRASTRUKTUR"),
        (4, "BANGUNAN DAN HARTANAH MAJLIS"),
        (5, "HARTA MODAL (ASET)"),
        (6, "IPOH BANDAR (BANDAR PINTAR)"),
        (7, "IPOH BANDAR (BANDAR RENDAH KARBON)"),
        (8, "PEMBANGUNAN EKONOMI MASYARAKAT DAN PELANCONGAN"),
    ]

    demografik = models.ForeignKey(UserInfo, on_delete=models.CASCADE, related_name="keutamaan")
    elemen = models.PositiveSmallIntegerField(choices=ELEMENT_CHOICES)
    pilihan = models.CharField(max_length=255)
    lokasi = models.CharField(max_length=255)
    butiran = models.TextField()

    def __str__(self):
        return f"{self.get_elemen_display()} - {self.pilihan}"


# Step 3: Cadangan
class Cadangan(models.Model):
    demografik = models.OneToOneField(UserInfo, on_delete=models.CASCADE, related_name="cadangan")
    cad = models.TextField(blank=True, null=True, max_length=100000)

    def __str__(self):
        return f"Cadangan oleh {self.demografik.name}"